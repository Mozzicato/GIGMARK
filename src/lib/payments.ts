import { db, uid } from "./db";

type PendingEscrowInput = {
  amount: number;
  gigId: string;
  userId: string;
  reference: string;
  source: "checkout" | "virtual_account";
};

export function recordPendingEscrow(input: PendingEscrowInput) {
  const existing = db.getTransactionByReference(input.reference);
  if (existing) {
    return existing;
  }

  return db.createTransaction({
    id: uid("txn"),
    user_id: input.userId,
    gig_id: input.gigId,
    kind: "escrow_lock",
    amount: input.amount,
    reference: input.reference,
    status: "pending",
    source: input.source,
    created_at: Date.now(),
  });
}

export function markEscrowFunded(reference: string, amount?: number) {
  const transaction = db.getTransactionByReference(reference);
  if (!transaction || !transaction.gig_id) return null;

  db.updateTransaction(transaction.id, {
    amount: amount ?? transaction.amount,
    status: "success",
  });

  const gig = db.getGigById(transaction.gig_id);
  if (!gig) return null;

  db.updateGig(gig.id, {
    escrow_locked: amount ?? transaction.amount,
  });

  return {
    gig: db.getGigById(gig.id),
    transaction: db.getTransactionByReference(reference),
  };
}

export function markEscrowFailed(reference: string) {
  const transaction = db.getTransactionByReference(reference);
  if (!transaction) return null;

  db.updateTransaction(transaction.id, { status: "failed" });
  return db.getTransactionByReference(reference);
}

export function releaseEscrowForGig(gigId: string) {
  const gig = db.getGigById(gigId);
  if (!gig || !gig.worker_id) return null;

  const releaseReference = `REL_${gigId}`;
  const existingWorkerPayout = db
    .getTransactionsByUser(gig.worker_id)
    .find((transaction) => transaction.reference === releaseReference);

  if (!existingWorkerPayout) {
    db.createTransaction({
      id: uid("txn"),
      user_id: gig.worker_id,
      gig_id: gig.id,
      kind: "payout",
      amount: gig.budget,
      reference: releaseReference,
      status: "success",
      source: "transfer",
      created_at: Date.now(),
    });

    const worker = db.getUserById(gig.worker_id);
    if (worker) {
      db.updateUser(worker.id, {
        wallet_balance: worker.wallet_balance + gig.budget,
      });
    }
  }

  const existingEmployerRelease = db
    .getTransactionsByUser(gig.employer_id)
    .find((transaction) => transaction.reference === releaseReference);

  if (!existingEmployerRelease) {
    db.createTransaction({
      id: uid("txn"),
      user_id: gig.employer_id,
      gig_id: gig.id,
      kind: "escrow_release",
      amount: gig.budget,
      reference: releaseReference,
      status: "success",
      source: "transfer",
      created_at: Date.now(),
    });
  }

  db.updateGig(gig.id, {
    escrow_locked: 0,
    status: "completed",
    completed_at: gig.completed_at || Date.now(),
  });

  return db.getGigById(gig.id);
}
