import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/squad";
import { markEscrowFailed, markEscrowFunded } from "@/lib/payments";

/**
 * GET /payment-callback?transaction_ref=...
 */
export async function GET(request: NextRequest) {
  try {
    const transactionRef = request.nextUrl.searchParams.get("transaction_ref");

    if (!transactionRef) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const verification = await verifyTransaction(transactionRef, "sandbox");
    const metadata = verification.data.meta as Record<string, any> | undefined;
    const gigId = metadata?.gig_id;

    if (!gigId) {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }

    if (verification.data.transaction_status === "success") {
      markEscrowFunded(transactionRef, verification.data.transaction_amount / 100);
      return NextResponse.redirect(new URL(`/gig/${gigId}?payment=success`, request.url));
    }

    if (verification.data.transaction_status === "pending") {
      return NextResponse.redirect(new URL(`/gig/${gigId}?payment=pending`, request.url));
    }

    markEscrowFailed(transactionRef);
    return NextResponse.redirect(new URL(`/gig/${gigId}?payment=failed`, request.url));
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
