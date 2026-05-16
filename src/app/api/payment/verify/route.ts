import { markEscrowFailed, markEscrowFunded } from "@/lib/payments";
import { verifyTransaction } from "@/lib/squad";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payment/verify?transaction_ref=...
 */
export async function GET(request: NextRequest) {
  try {
    const transactionRef = request.nextUrl.searchParams.get("transaction_ref");

    if (!transactionRef) {
      return NextResponse.json({ error: "Missing transaction_ref" }, { status: 400 });
    }

    const squadResponse = await verifyTransaction(transactionRef, "sandbox");
    const status = squadResponse.data.transaction_status;

    if (status === "success") {
      markEscrowFunded(transactionRef, squadResponse.data.transaction_amount / 100);
    } else if (status === "failed" || status === "abandoned") {
      markEscrowFailed(transactionRef);
    }

    return NextResponse.json({
      transaction_ref: squadResponse.data.transaction_ref,
      transaction_status: status,
      amount: squadResponse.data.transaction_amount / 100,
      merchant_amount: squadResponse.data.merchant_amount / 100,
      email: squadResponse.data.email,
      customer_name: squadResponse.data.customer_name,
      payment_type: squadResponse.data.payment_type,
      created_at: squadResponse.data.created_at,
      metadata: squadResponse.data.meta,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
