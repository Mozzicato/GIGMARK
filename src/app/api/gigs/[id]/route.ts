import { db, uid } from "@/lib/db";
import { releaseEscrowForGig } from "@/lib/payments";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gig = db.getGigById(id);

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const employer = db.getUserById(gig.employer_id);
    let pow = null;
    if (gig.status === "completed" || gig.status === "disputed") {
      pow = db.getProofOfWorkByGig(id);
    }

    return NextResponse.json({ ...gig, employer_name: employer?.name, proof_of_work: pow });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gig" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, worker_id, rating, feedback } = body;

    const gig = db.getGigById(id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    if (status === "cancelled") {
      if (gig.status === "completed" || gig.status === "cancelled") {
        return NextResponse.json(
          { error: `Cannot cancel a ${gig.status} gig` },
          { status: 400 }
        );
      }

      const now = Date.now();
      const refundAmount = gig.escrow_locked;

      if (refundAmount > 0) {
        const employer = db.getUserById(gig.employer_id);
        if (employer) {
          db.updateUser(gig.employer_id, {
            wallet_balance: employer.wallet_balance + refundAmount,
          });
        }

        db.createTransaction({
          id: uid("txn"),
          user_id: gig.employer_id,
          gig_id: id,
          kind: "refund",
          amount: refundAmount,
          reference: `REF_${id}_${now}`,
          status: "success",
          source: "wallet",
          created_at: now,
        });
      }

      db.updateGig(id, {
        status: "cancelled",
        escrow_locked: 0,
        completed_at: now,
      });

      const updated = db.getGigById(id);
      const employer = updated ? db.getUserById(updated.employer_id) : null;
      return NextResponse.json({
        ...updated,
        employer_name: employer?.name,
        refunded: refundAmount,
      });
    }

    if (worker_id && !gig.worker_id) {
      db.updateGig(id, {
        worker_id,
        status: "assigned",
      });
    }

    if (status === "completed" && rating && gig.worker_id) {
      const now = Date.now();
      const existingProof = db.getProofOfWorkByGig(id);

      db.updateGig(id, {
        status: "completed",
        completed_at: now,
      });

      if (!existingProof) {
        db.createProofOfWork({
          id: uid("pow"),
          worker_id: gig.worker_id,
          gig_id: id,
          rating,
          feedback: feedback || null,
          amount: gig.budget,
          verified_at: now,
        });
      }

      const worker = db.getUserById(gig.worker_id);
      if (worker) {
        const newTrustScore = Math.min(
          100,
          worker.trust_score + (rating === 5 ? 2 : rating === 4 ? 1 : 0)
        );
        db.updateUser(gig.worker_id, { trust_score: newTrustScore });
      }

      if (gig.escrow_locked > 0) {
        releaseEscrowForGig(id);
      }
    }

    const updated = db.getGigById(id);
    const employer = updated ? db.getUserById(updated.employer_id) : null;

    return NextResponse.json({ ...updated, employer_name: employer?.name });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gig" }, { status: 500 });
  }
}
