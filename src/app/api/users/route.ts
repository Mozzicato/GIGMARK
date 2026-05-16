import { db, uid } from "@/lib/db";
import { ensureVirtualAccount } from "@/lib/accounts";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const users = db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, role, location, language, bio, skills } = body;

    if (!phone || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if phone already exists
    if (db.getUserByPhone(phone)) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    const id = uid("u");
    const now = Date.now();

    const user = db.createUser({
      id,
      phone,
      name,
      role,
      location: location || null,
      language: language || "en",
      bio: bio || null,
      skills: JSON.stringify(skills || []),
      wallet_balance: role === "employer" ? 250000 : 0,
      trust_score: 50,
      created_at: now,
    });

    const userWithAccount = ensureVirtualAccount(user);

    return NextResponse.json(userWithAccount, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
