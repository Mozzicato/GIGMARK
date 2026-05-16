import { db } from "@/lib/db";
import { recordPendingEscrow } from "@/lib/payments";
import { generateTransactionRef, initiatePayment } from "@/lib/squad";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/initiate
 * Body: { gig_id, employer_id, channel? }
 */
export async function POST(request: NextRequest) {
  try {
    const { gig_id, employer_id, channel } = await request.json();

    if (!gig_id || !employer_id) {
      return NextResponse.json({ error: "Missing gig_id or employer_id" }, { status: 400 });
    }

    const gig = db.getGigById(gig_id);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const employer = db.getUserById(employer_id);
    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const transactionRef = generateTransactionRef(gig_id);

    const squadResponse = await initiatePayment(
      {
        amount: gig.budget * 100,
        email: `${employer.id}@gigmark.app`,
        currency: "NGN",
        transaction_ref: transactionRef,
        customer_name: employer.name,
        callback_url: `${process.env.APP_URL || "http://localhost:3000"}/payment-callback`,
        payment_channels:
          channel === "transfer"
            ? ["transfer"]
            : channel === "card"
              ? ["card"]
              : undefined,
        metadata: {
          gig_id,
          employer_id,
          payment_channel: channel || "card",
          gig_title: gig.title,
          gig_category: gig.category,
        },
      },
      "sandbox"
    );

    recordPendingEscrow({
      amount: gig.budget,
      gigId: gig_id,
      userId: employer_id,
      reference: transactionRef,
      source: "checkout",
    });

    return NextResponse.json({
      checkout_url: squadResponse.data.checkout_url,
      transaction_ref: transactionRef,
      merchant_amount: squadResponse.data.transaction_amount,
      amount: gig.budget,
      currency: "NGN",
      payment_channel: channel || "card",
    });
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
