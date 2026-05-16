import { NextRequest, NextResponse } from "next/server";
import { backfillAllVirtualAccounts } from "@/lib/accounts";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!host.includes("localhost") && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  backfillAllVirtualAccounts();
  const users = db.getAllUsers().map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    virtual_account_number: u.virtual_account_number,
    virtual_account_bank: u.virtual_account_bank,
  }));

  return NextResponse.json({ status: "ok", users });
}
