import { markEscrowFailed, markEscrowFunded } from "@/lib/payments";
import { verifySquadWebhookSignature } from "@/lib/squad";
import { NextRequest, NextResponse } from "next/server";

function resolveReference(payload: Record<string, any>) {
  return (
    payload.transaction_ref ||
    payload.transaction_reference ||
    payload.merchant_reference ||
    payload?.data?.transaction_ref ||
    payload?.data?.transaction_reference ||
    payload?.data?.merchant_reference
  );
}

function resolveStatus(payload: Record<string, any>) {
  const raw =
    payload.transaction_status ||
    payload.status ||
    payload?.data?.transaction_status ||
    payload?.event;

  return typeof raw === "string" ? raw.toLowerCase() : "";
}

function resolveAmount(payload: Record<string, any>) {
  const raw =
    payload.amount_received ||
    payload.merchant_amount ||
    payload.amount ||
    payload?.data?.amount_received ||
    payload?.data?.merchant_amount ||
    payload?.data?.amount;

  const amount = Number(raw);
  if (Number.isNaN(amount)) return undefined;
  return amount >= 100000 ? amount / 100 : amount;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-squad-encrypted-body");

  try {
    if (!verifySquadWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as Record<string, any>;
    const reference = resolveReference(payload);
    const status = resolveStatus(payload);
    const amount = resolveAmount(payload);

    if (!reference) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (status.includes("success")) {
      markEscrowFunded(reference, amount);
    } else if (status.includes("fail") || status.includes("abandon") || status.includes("expire")) {
      markEscrowFailed(reference);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Squad webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
