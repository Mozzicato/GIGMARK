import { db, type User } from "./db";

const ACCOUNT_BANK = "GTBank";

function generateAccountNumber(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const base = 9200000000 + (hash % 99999999);
  return base.toString().slice(0, 10);
}

export function ensureVirtualAccount(user: User): User {
  if (user.virtual_account_number && user.virtual_account_bank === ACCOUNT_BANK) return user;

  const accountNumber = user.virtual_account_number || generateAccountNumber(user.id);
  const accountName =
    user.role === "employer"
      ? `${user.name} (Gigmark Escrow)`
      : `${user.name} (Gigmark Payout)`;

  db.updateUser(user.id, {
    virtual_account_number: accountNumber,
    virtual_account_bank: ACCOUNT_BANK,
    virtual_account_name: accountName,
  });

  return db.getUserById(user.id) || user;
}

const RECONCILED_FLAG_REF = "RECONCILE_WALLET_ESCROW_V1";

export function backfillAllVirtualAccounts() {
  for (const user of db.getAllUsers()) {
    if (!user.virtual_account_number || user.virtual_account_bank !== ACCOUNT_BANK) {
      ensureVirtualAccount(user);
    }
  }

  // One-time reconciliation: any active escrow on a gig should already have
  // been debited from the employer wallet under the new model. For demo state
  // that pre-dates the model change, balance the books once.
  if (db.getTransactionByReference(RECONCILED_FLAG_REF)) return;

  const employers = db.getAllUsers().filter((u) => u.role === "employer");
  for (const employer of employers) {
    const activeEscrow = db
      .getAllGigs()
      .filter((g) => g.employer_id === employer.id && g.escrow_locked > 0 && g.status !== "completed" && g.status !== "cancelled")
      .reduce((sum, g) => sum + g.escrow_locked, 0);

    if (activeEscrow > 0) {
      const nextBalance = Math.max(0, employer.wallet_balance - activeEscrow);
      db.updateUser(employer.id, { wallet_balance: nextBalance });
    }
  }

  db.createTransaction({
    id: `txn_${Date.now()}`,
    user_id: "system",
    gig_id: null,
    kind: "fee",
    amount: 0,
    reference: RECONCILED_FLAG_REF,
    status: "success",
    source: "manual",
    created_at: Date.now(),
  });
}
