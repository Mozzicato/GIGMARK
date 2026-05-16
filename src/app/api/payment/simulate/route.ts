import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markEscrowFunded } from "@/lib/payments";
import { simulateSandboxPayment } from "@/lib/squad";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    if (!origin.includes("localhost") && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Simulator disabled in non-local env" }, { status: 403 });
    }

    const body = await request.json();
    const { transaction_ref, virtual_account_number, amount } = body;
    if (!transaction_ref || !amount) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    let squadWarning: string | null = null;
    if (virtual_account_number) {
      try {
        await simulateSandboxPayment(virtual_account_number, amount);
      } catch (squadError: any) {
        squadWarning = squadError?.message || "Squad simulator call failed; applied local escrow only.";
        console.warn("Squad simulator failed, falling back to local escrow lock:", squadWarning);
      }
    }

    const settled = markEscrowFunded(transaction_ref, amount);
    if (!settled?.gig) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      message: "Simulated payment applied",
      gig_id: settled.gig.id,
      escrow_locked: settled.gig.escrow_locked,
      squad_warning: squadWarning,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Simulator failed" }, { status: 500 });
  }
}
