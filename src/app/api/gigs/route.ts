import { db, uid } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const HAS_ESCROW = new Set(["open", "assigned", "submitted"]);

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const category = request.nextUrl.searchParams.get("category");
    const employerId = request.nextUrl.searchParams.get("employer_id");

    let gigs = db.getAllGigs();

    if (status) {
      gigs = gigs.filter(g => g.status === status);
    }
    if (category) {
      gigs = gigs.filter(g => g.category === category);
    }
    if (employerId) {
      gigs = gigs.filter(g => g.employer_id === employerId);
    }

    gigs = gigs.map(g => {
      const employer = db.getUserById(g.employer_id);
      return {
        ...g,
        employer_name: employer?.name,
      };
    }).sort((a, b) => b.created_at - a.created_at);

    return NextResponse.json(gigs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employer_id,
      title,
      description,
      category,
      required_skills,
      budget,
      location,
    } = body;

    if (!employer_id || !title || !category || !budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const employer = db.getUserById(employer_id);
    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      return NextResponse.json({ error: "Budget must be a positive number" }, { status: 400 });
    }

    if (employer.wallet_balance < numericBudget) {
      return NextResponse.json(
        {
          error: "Wallet balance is below the gig budget. Top up your Gigmark account before posting.",
          wallet_balance: employer.wallet_balance,
          required: numericBudget,
        },
        { status: 402 }
      );
    }

    const id = uid("g");
    const now = Date.now();

    const gig = db.createGig({
      id,
      employer_id,
      worker_id: null,
      title,
      description: description || "",
      category,
      required_skills: JSON.stringify(required_skills || []),
      budget: numericBudget,
      location: location || "Remote",
      status: "open",
      escrow_locked: numericBudget,
      created_at: now,
      completed_at: null,
    });

    db.updateUser(employer_id, { wallet_balance: employer.wallet_balance - numericBudget });

    db.createTransaction({
      id: uid("txn"),
      user_id: employer_id,
      gig_id: id,
      kind: "escrow_lock",
      amount: numericBudget,
      reference: `ESC_${id}`,
      status: "success",
      source: "wallet",
      created_at: now,
    });

    return NextResponse.json({ ...gig, employer_name: employer.name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gig" }, { status: 500 });
  }
}
