import { db } from "@/lib/db";
import { recordPendingEscrow } from "@/lib/payments";
import {
  generateTransactionRef,
  initiateDynamicVirtualAccount,
  requeryDynamicVirtualAccount,
} from "@/lib/squad";
import { NextRequest, NextResponse } from "next/server";

function buildSandboxFallbackAccount(transactionRef: string, gigBudget: number) {
  const accountNumber = (9200000000 + Math.floor(Math.random() * 99999999)).toString().slice(0, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  return {
    account_name: "Gigmark Escrow Account",
    account_number: accountNumber,
    expected_amount: String(gigBudget * 100),
    expires_at: expiresAt,
    bank: "GTBank",
    currency: "NGN",
    transaction_reference: transactionRef,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { gig_id, employer_id, duration } = await request.json();

    if (!gig_id || !employer_id) {
      return NextResponse.json({ error: "Missing gig_id or employer_id" }, { status: 400 });
    }

    const gig = db.getGigById(gig_id);
    const employer = db.getUserById(employer_id);

    if (!gig || !employer) {
      return NextResponse.json({ error: "Gig or employer not found" }, { status: 404 });
    }

    const transactionRef = generateTransactionRef(gig_id);

    let account: {
      account_name: string;
      account_number: string;
      expected_amount: string;
      expires_at: string;
      bank: string;
      currency: string;
    };
    let sandboxFallback = false;

    try {
      const squadResponse = await initiateDynamicVirtualAccount(
        {
          amount: gig.budget * 100,
          email: `${employer.id}@gigmark.app`,
          transaction_ref: transactionRef,
          duration: duration || 900,
        },
        "sandbox"
      );
      account = {
        account_name: squadResponse.data.account_name,
        account_number: squadResponse.data.account_number,
        expected_amount: squadResponse.data.expected_amount,
        expires_at: squadResponse.data.expires_at,
        bank: squadResponse.data.bank,
        currency: squadResponse.data.currency,
      };
    } catch (squadError: any) {
      console.warn(
        "Squad DVA call failed, generating local sandbox-fallback account:",
        squadError?.message
      );
      account = buildSandboxFallbackAccount(transactionRef, gig.budget);
      sandboxFallback = true;
    }

    recordPendingEscrow({
      amount: gig.budget,
      gigId: gig_id,
      userId: employer_id,
      reference: transactionRef,
      source: "virtual_account",
    });

    return NextResponse.json({
      transaction_ref: transactionRef,
      gig_id,
      sandbox_fallback: sandboxFallback,
      ...account,
    });
  } catch (error: any) {
    console.error("Dynamic virtual account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create dynamic virtual account" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const transactionReference = request.nextUrl.searchParams.get("transaction_ref");
    if (!transactionReference) {
      return NextResponse.json({ error: "Missing transaction_ref" }, { status: 400 });
    }

    const response = await requeryDynamicVirtualAccount(transactionReference, "sandbox");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Dynamic virtual account requery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to re-query dynamic virtual account" },
      { status: 500 }
    );
  }
}
