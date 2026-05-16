import { db, uid } from "./db";
import { backfillAllVirtualAccounts } from "./accounts";

let seeded = false;

function ensureTransactionHistoryForCompletedGig(gigId: string) {
  const gig = db.getGigById(gigId);
  if (!gig || !gig.worker_id) return;

  const fundingReference = `FUND_${gig.id}`;
  const releaseReference = `REL_${gig.id}`;

  if (!db.getTransactionsByUser(gig.employer_id).find((transaction) => transaction.reference === fundingReference)) {
    db.createTransaction({
      id: uid("txn"),
      user_id: gig.employer_id,
      gig_id: gig.id,
      kind: "escrow_lock",
      amount: gig.budget,
      reference: fundingReference,
      status: "success",
      source: "checkout",
      created_at: gig.created_at,
    });
  }

  if (!db.getTransactionsByUser(gig.employer_id).find((transaction) => transaction.reference === releaseReference)) {
    db.createTransaction({
      id: uid("txn"),
      user_id: gig.employer_id,
      gig_id: gig.id,
      kind: "escrow_release",
      amount: gig.budget,
      reference: releaseReference,
      status: "success",
      source: "transfer",
      created_at: gig.completed_at || Date.now(),
    });
  }

  if (!db.getTransactionsByUser(gig.worker_id).find((transaction) => transaction.reference === releaseReference)) {
    db.createTransaction({
      id: uid("txn"),
      user_id: gig.worker_id,
      gig_id: gig.id,
      kind: "payout",
      amount: gig.budget,
      reference: releaseReference,
      status: "success",
      source: "transfer",
      created_at: gig.completed_at || Date.now(),
    });
  }
}

function ensureDemoUpgrades() {
  const amara = db.getUserByName("Amara Okafor");
  const tunde = db.getUserByName("Tunde Balogun");
  const chiamaka = db.getUserByName("Chiamaka Eze");
  const bella = db.getUserByName("Bella Boutique");
  const greenstack = db.getUserByName("Greenstack Foods");

  if (amara && bella) {
    const extraCompletedGigs = [
      {
        title: "Weekend alteration rush",
        description: "Urgent dress resizing and finishing for a weekend event collection.",
        category: "tailoring",
        skills: ["tailoring", "alterations"],
        budget: 28000,
        rating: 5,
        feedback: "Fast turnaround and excellent finishing.",
      },
      {
        title: "Repair 20 staff uniforms",
        description: "Fix seams and fit issues across a batch of boutique staff uniforms.",
        category: "tailoring",
        skills: ["tailoring", "repairs"],
        budget: 34000,
        rating: 5,
        feedback: "Handled volume well and stayed consistent throughout.",
      },
    ];

    extraCompletedGigs.forEach((item, index) => {
      const existing = db.getAllGigs().find((gig) => gig.title === item.title);
      if (existing) {
        ensureTransactionHistoryForCompletedGig(existing.id);
        return;
      }

      const created = Date.now() - (index + 3) * 1000 * 60 * 60 * 24 * 12;
      const gigId = uid("g");

      db.createGig({
        id: gigId,
        employer_id: bella.id,
        worker_id: amara.id,
        title: item.title,
        description: item.description,
        category: item.category,
        required_skills: JSON.stringify(item.skills),
        budget: item.budget,
        location: "Lagos, NG",
        status: "completed",
        escrow_locked: 0,
        created_at: created,
        completed_at: created + 1000 * 60 * 60 * 24 * 2,
      });

      db.createProofOfWork({
        id: uid("pow"),
        worker_id: amara.id,
        gig_id: gigId,
        rating: item.rating,
        feedback: item.feedback,
        amount: item.budget,
        verified_at: created + 1000 * 60 * 60 * 24 * 2,
      });

      ensureTransactionHistoryForCompletedGig(gigId);
    });
  }

  if (chiamaka && greenstack && !db.getAllGigs().find((gig) => gig.title === "Instagram launch visuals for granola pack")) {
    const created = Date.now() - 1000 * 60 * 60 * 24 * 9;
    const gigId = uid("g");

    db.createGig({
      id: gigId,
      employer_id: greenstack.id,
      worker_id: chiamaka.id,
      title: "Instagram launch visuals for granola pack",
      description: "Create a fast set of launch assets for social media and in-store display.",
      category: "graphic design",
      required_skills: JSON.stringify(["graphic design", "branding"]),
      budget: 40000,
      location: "Remote",
      status: "completed",
      escrow_locked: 0,
      created_at: created,
      completed_at: created + 1000 * 60 * 60 * 24,
    });

    db.createProofOfWork({
      id: uid("pow"),
      worker_id: chiamaka.id,
      gig_id: gigId,
      rating: 5,
      feedback: "Excellent brand fit and quick revisions.",
      amount: 40000,
      verified_at: created + 1000 * 60 * 60 * 24,
    });

    ensureTransactionHistoryForCompletedGig(gigId);
  }

  if (tunde && bella && !db.getAllGigs().find((gig) => gig.title === "Deliver boutique orders across Lekki")) {
    db.createGig({
      id: uid("g"),
      employer_id: bella.id,
      worker_id: tunde.id,
      title: "Deliver boutique orders across Lekki",
      description: "Handle same-day deliveries for premium customers and confirm drop-off quickly.",
      category: "delivery",
      required_skills: JSON.stringify(["delivery", "logistics"]),
      budget: 18000,
      location: "Lagos, NG",
      status: "assigned",
      escrow_locked: 18000,
      created_at: Date.now() - 1000 * 60 * 60 * 18,
      completed_at: null,
    });
  }

  db.getAllGigs()
    .filter((gig) => gig.status === "completed")
    .forEach((gig) => ensureTransactionHistoryForCompletedGig(gig.id));

  if (amara) {
    const workerTransactions = db.getTransactionsByUser(amara.id).filter(
      (transaction) => (transaction.status || "success") === "success"
    );
    const payoutTotal = workerTransactions
      .filter((transaction) => transaction.kind === "payout")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    if (payoutTotal > amara.wallet_balance) {
      db.updateUser(amara.id, { wallet_balance: payoutTotal });
    }
  }
}

export function ensureSeed() {
  if (seeded) return;

  if (db.getAllUsers().length > 0) {
    backfillAllVirtualAccounts();
    ensureDemoUpgrades();
    seeded = true;
    return;
  }

  const now = Date.now();

  const workers = [
    {
      name: "Amara Okafor",
      phone: "+2348012345001",
      location: "Lagos, NG",
      skills: ["tailoring", "fashion design", "alterations"],
      bio: "Tailor with 6 years experience in ankara and bridal wear.",
      trust: 86,
    },
    {
      name: "Tunde Balogun",
      phone: "+2348012345002",
      location: "Lagos, NG",
      skills: ["delivery", "logistics", "motorcycle"],
      bio: "Same-day dispatch rider across mainland Lagos.",
      trust: 78,
    },
    {
      name: "Chiamaka Eze",
      phone: "+2348012345003",
      location: "Abuja, NG",
      skills: ["graphic design", "logo", "branding"],
      bio: "Visual designer for small businesses and startups.",
      trust: 91,
    },
    {
      name: "Yusuf Bello",
      phone: "+2348012345004",
      location: "Kano, NG",
      skills: ["plumbing", "repairs", "maintenance"],
      bio: "Certified plumber, residential and commercial.",
      trust: 72,
    },
    {
      name: "Ngozi Adeyemi",
      phone: "+2348012345005",
      location: "Lagos, NG",
      skills: ["tutoring", "mathematics", "secondary school"],
      bio: "Maths tutor for WAEC and JAMB prep.",
      trust: 88,
    },
  ];

  for (const worker of workers) {
    db.createUser({
      id: uid("u"),
      phone: worker.phone,
      name: worker.name,
      role: "worker",
      location: worker.location,
      language: "en",
      bio: worker.bio,
      skills: JSON.stringify(worker.skills),
      wallet_balance: 0,
      trust_score: worker.trust,
      created_at: now,
    });
  }

  const employers = [
    {
      name: "Bella Boutique",
      phone: "+2348099000001",
      location: "Lagos, NG",
      bio: "Boutique in Lekki, regularly hires tailors and dispatch riders.",
    },
    {
      name: "Greenstack Foods",
      phone: "+2348099000002",
      location: "Abuja, NG",
      bio: "Food startup needing branding and delivery support.",
    },
  ];

  for (const employer of employers) {
    db.createUser({
      id: uid("u"),
      phone: employer.phone,
      name: employer.name,
      role: "employer",
      location: employer.location,
      language: "en",
      bio: employer.bio,
      skills: "[]",
      wallet_balance: 250000,
      trust_score: 80,
      created_at: now,
    });
  }

  const amara = db.getUserByName("Amara Okafor");
  const bella = db.getUserByName("Bella Boutique");
  const greenstack = db.getUserByName("Greenstack Foods");

  if (amara && bella) {
    const completedGigs = [
      {
        title: "Sew 5 ankara dresses",
        description: "Bulk order of ankara dresses for the boutique.",
        category: "tailoring",
        skills: ["tailoring", "ankara"],
        budget: 45000,
        rating: 5,
        feedback: "Delivered ahead of schedule. Excellent stitching.",
      },
      {
        title: "Alter wedding gown",
        description: "Take-in and hem adjustment on bridal gown.",
        category: "tailoring",
        skills: ["tailoring", "bridal"],
        budget: 12000,
        rating: 4,
        feedback: "Good work, minor delay in pickup.",
      },
    ];

    for (let i = 0; i < completedGigs.length; i++) {
      const gig = completedGigs[i];
      const gigId = uid("g");
      const created = now - (i + 1) * 1000 * 60 * 60 * 24 * 14;

      db.createGig({
        id: gigId,
        employer_id: bella.id,
        worker_id: amara.id,
        title: gig.title,
        description: gig.description,
        category: gig.category,
        required_skills: JSON.stringify(gig.skills),
        budget: gig.budget,
        location: "Lagos, NG",
        status: "completed",
        escrow_locked: 0,
        created_at: created,
        completed_at: created + 1000 * 60 * 60 * 24 * 3,
      });

      db.createProofOfWork({
        id: uid("pow"),
        worker_id: amara.id,
        gig_id: gigId,
        rating: gig.rating,
        feedback: gig.feedback,
        amount: gig.budget,
        verified_at: created + 1000 * 60 * 60 * 24 * 3,
      });
    }
  }

  if (greenstack) {
    db.createGig({
      id: uid("g"),
      employer_id: greenstack.id,
      worker_id: null,
      title: "Design product label for granola line",
      description: "We need a modern, vibrant label design for a new granola SKU. Two rounds of revisions.",
      category: "graphic design",
      required_skills: JSON.stringify(["graphic design", "branding"]),
      budget: 35000,
      location: "Remote",
      status: "open",
      escrow_locked: 0,
      created_at: now,
      completed_at: null,
    });
  }

  backfillAllVirtualAccounts();
  ensureDemoUpgrades();
  seeded = true;
}
