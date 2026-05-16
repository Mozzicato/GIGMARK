import path from "node:path";
import fs from "node:fs";
// Bundled seed — Webpack/Turbopack inlines this into the serverless bundle so
// it works on Vercel where the project's `data/` folder isn't readable at
// runtime. Local dev still prefers the on-disk copy so edits survive restarts.
import seedData from "../../data/gigmark.json";

const isReadOnlyFs = !!process.env.VERCEL;
const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "gigmark.json");

// In-memory data store — initialised from the bundled seed, optionally
// hydrated from disk on local dev, never written to disk on serverless.
let data: {
  users: any[];
  gigs: any[];
  proof_of_work: any[];
  transactions: any[];
} = structuredClone(seedData) as any;

function loadDb() {
  if (isReadOnlyFs) return;
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      data = JSON.parse(content);
    }
  } catch (e) {
    console.error("Failed to load database from disk; using bundled seed", e);
  }
}

function saveDb() {
  if (isReadOnlyFs) return;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save database", e);
  }
}

loadDb();

export type User = {
  id: string;
  phone: string;
  name: string;
  role: "worker" | "employer";
  location: string | null;
  language: string | null;
  bio: string | null;
  skills: string;
  wallet_balance: number;
  trust_score: number;
  virtual_account_number?: string | null;
  virtual_account_bank?: string | null;
  virtual_account_name?: string | null;
  verification_kind?: "NIN" | "BVN" | null;
  verification_last4?: string | null;
  created_at: number;
};

export type Gig = {
  id: string;
  employer_id: string;
  worker_id: string | null;
  title: string;
  description: string;
  category: string;
  required_skills: string;
  budget: number;
  location: string | null;
  status:
    | "open"
    | "assigned"
    | "submitted"
    | "completed"
    | "disputed"
    | "cancelled";
  escrow_locked: number;
  created_at: number;
  completed_at: number | null;
};

export type ProofOfWork = {
  id: string;
  worker_id: string;
  gig_id: string;
  rating: number | null;
  feedback: string | null;
  amount: number;
  verified_at: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  gig_id: string | null;
  kind: "escrow_lock" | "escrow_release" | "payout" | "topup" | "fee" | "refund";
  amount: number;
  reference: string | null;
  status?: "pending" | "success" | "failed";
  source?: "checkout" | "virtual_account" | "transfer" | "manual" | "wallet";
  created_at: number;
};

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function parseSkills(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

// Simple database query interface
export const db = {
  // Users table
  createUser(user: User) {
    data.users.push(user);
    saveDb();
    return user;
  },
  getUserById(id: string): User | undefined {
    return data.users.find(u => u.id === id);
  },
  getUserByPhone(phone: string): User | undefined {
    return data.users.find(u => u.phone === phone);
  },
  getUserByName(name: string): User | undefined {
    return data.users.find(u => u.name === name);
  },
  getAllUsers(): User[] {
    return [...data.users].sort((a, b) => b.created_at - a.created_at);
  },
  updateUser(id: string, updates: Partial<User>) {
    const user = data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      saveDb();
    }
    return user;
  },

  // Gigs table
  createGig(gig: Gig) {
    data.gigs.push(gig);
    saveDb();
    return gig;
  },
  getGigById(id: string): Gig | undefined {
    return data.gigs.find(g => g.id === id);
  },
  getAllGigs(): Gig[] {
    return [...data.gigs];
  },
  getGigsByEmployer(employer_id: string): Gig[] {
    return data.gigs.filter(g => g.employer_id === employer_id);
  },
  getOpenGigs(): Gig[] {
    return data.gigs.filter(g => g.status === "open");
  },
  updateGig(id: string, updates: Partial<Gig>) {
    const gig = data.gigs.find(g => g.id === id);
    if (gig) {
      Object.assign(gig, updates);
      saveDb();
    }
    return gig;
  },

  // Proof of Work table
  createProofOfWork(pow: ProofOfWork) {
    data.proof_of_work.push(pow);
    saveDb();
    return pow;
  },
  getProofOfWorkByGig(gig_id: string): ProofOfWork | undefined {
    return data.proof_of_work.find(p => p.gig_id === gig_id);
  },
  getProofOfWorkByWorker(worker_id: string): ProofOfWork[] {
    return data.proof_of_work.filter(p => p.worker_id === worker_id);
  },

  // Transactions table
  createTransaction(transaction: Transaction) {
    data.transactions.push(transaction);
    saveDb();
    return transaction;
  },
  getTransactionsByUser(user_id: string): Transaction[] {
    return data.transactions.filter(t => t.user_id === user_id);
  },
  getAllTransactions(): Transaction[] {
    return [...data.transactions];
  },
  getTransactionByReference(reference: string): Transaction | undefined {
    return data.transactions.find(t => t.reference === reference);
  },
  updateTransaction(id: string, updates: Partial<Transaction>) {
    const transaction = data.transactions.find(t => t.id === id);
    if (transaction) {
      Object.assign(transaction, updates);
      saveDb();
    }
    return transaction;
  },
};

export default db;
