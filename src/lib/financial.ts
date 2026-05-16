import type { ProofOfWork, Transaction, User } from "./db";
import { formatMoney } from "./format";

export type FinancialOffer = {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string;
  action: string;
};

export type FinancialProfile = {
  score: number;
  tier: string;
  readiness: string;
  summary: string;
  signals: string[];
  insights: string[];
  next_actions: string[];
  metrics: {
    trust: number;
    completion: number;
    earnings: number;
    liquidity: number;
    rating: number;
    activity: number;
  };
  offers: FinancialOffer[];
};

type FinancialInputs = {
  user: User;
  completedGigs: number;
  averageRating: number | null;
  totalEarnings: number;
  transactions: Transaction[];
  proofRecords: ProofOfWork[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function buildOffers(score: number, totalEarnings: number): FinancialOffer[] {
  if (score >= 85) {
    return [
      {
        id: "capital-line",
        title: "Working capital line",
        provider: "Partner bank",
        description: "For repeat earners with strong completion history and stable inflows.",
        eligibility: "Best for workers with 4+ verified gigs and consistent payments.",
        action: "Request pre-approval",
      },
      {
        id: "invoice-advance",
        title: "Invoice advance",
        provider: "Embedded finance partner",
        description: "Unlock cash before settlement on confirmed gig earnings.",
        eligibility: "Needs verified escrow history and positive proof-of-work ratings.",
        action: "Advance earnings",
      },
      {
        id: "equipment-lease",
        title: "Equipment lease",
        provider: "Growth finance partner",
        description: "Finance tools, devices, or work equipment tied to income history.",
        eligibility: "For workers with growing income and low dispute frequency.",
        action: "View lease options",
      },
    ];
  }

  if (score >= 70) {
    return [
      {
        id: "income-smoother",
        title: "Income smoothing",
        provider: "Partner savings bank",
        description: "A low-friction savings plan that keeps earnings moving during slow weeks.",
        eligibility: `Built for workers with at least ${formatMoney(Math.max(10000, Math.round(totalEarnings / 4)))} in verified earnings.`,
        action: "Start savings plan",
      },
      {
        id: "micro-credit",
        title: "Micro-credit pre-check",
        provider: "Specialized lender",
        description: "Short-term credit for transport, materials, or working float.",
        eligibility: "Best for workers with regular gig completion and stable trust scores.",
        action: "Check eligibility",
      },
      {
        id: "gear-boost",
        title: "Equipment boost",
        provider: "Merchant finance partner",
        description: "Small financing for the tools that help you earn more gigs.",
        eligibility: "For workers with proof-of-work history and repeated buyer approval.",
        action: "See offers",
      },
    ];
  }

  if (score >= 55) {
    return [
      {
        id: "savings-starter",
        title: "Savings starter wallet",
        provider: "Partner bank",
        description: "Turn gig earnings into a goal-based savings habit.",
        eligibility: "Available once at least one gig has been verified.",
        action: "Activate wallet",
      },
      {
        id: "transport-float",
        title: "Transport float",
        provider: "Micro-lender",
        description: "Small bridge support for getting to and from jobs.",
        eligibility: "Best for workers with completed jobs and active profile history.",
        action: "Review terms",
      },
      {
        id: "financial-coaching",
        title: "Financial coaching",
        provider: "Gigmark partner network",
        description: "A lightweight path into savings discipline and money management.",
        eligibility: "For workers still building their proof-of-work trail.",
        action: "Book a session",
      },
    ];
  }

  return [
    {
      id: "wallet-onboarding",
      title: "Wallet onboarding",
      provider: "Partner bank",
      description: "Set up your first structured wallet so earnings become trackable financial history.",
      eligibility: "Every verified worker can start here.",
      action: "Set up wallet",
    },
    {
      id: "goal-savings",
      title: "Goal savings",
      provider: "Savings partner",
      description: "A simple target-based savings layer to build momentum before credit products unlock.",
      eligibility: "Recommended for new profiles with limited gig history.",
      action: "Start saving",
    },
    {
      id: "credit-builder",
      title: "Credit builder path",
      provider: "Specialized lender",
      description: "A guided path that turns work history into future borrowing readiness.",
      eligibility: "Unlocks as trust and earnings grow.",
      action: "See roadmap",
    },
  ];
}

export function computeFinancialProfile({
  user,
  completedGigs,
  averageRating,
  totalEarnings,
  transactions,
  proofRecords,
}: FinancialInputs): FinancialProfile {
  const successfulTransactions = transactions.filter(
    (transaction) => (transaction.status || "success") === "success"
  );
  const payoutTransactions = successfulTransactions.filter(
    (transaction) => transaction.kind === "payout"
  );

  const trustScore = clamp(user.trust_score, 0, 100);
  const completionScore = clamp(completedGigs * 18, 0, 100);
  const earningsScore = clamp((totalEarnings / 200000) * 100, 0, 100);
  const liquidityScore = clamp((user.wallet_balance / 250000) * 100, 0, 100);
  const ratingScore = averageRating ? clamp((averageRating / 5) * 100, 0, 100) : 50;
  const activityScore = clamp(successfulTransactions.length * 8 + proofRecords.length * 6, 0, 100);

  const score = Math.round(
    trustScore * 0.28 +
      completionScore * 0.18 +
      earningsScore * 0.18 +
      liquidityScore * 0.1 +
      ratingScore * 0.14 +
      activityScore * 0.12
  );

  const tier =
    score >= 85
      ? "Prime ready"
      : score >= 70
        ? "Growth ready"
        : score >= 55
          ? "Starter eligible"
          : "Building profile";

  const readiness =
    score >= 85
      ? "This profile is ready for premium lending and partner banking offers."
      : score >= 70
        ? "This profile can be shown to lenders as a strong early-stage signal."
        : score >= 55
          ? "This profile is beginning to build meaningful financial trust."
          : "This profile should focus on proof-of-work, savings, and more verified gigs first.";

  const signals = [
    `${completedGigs} verified gigs`,
    `${successfulTransactions.length} payment-linked transactions`,
    `${proofRecords.length} proof-of-work records`,
    `Wallet balance ${formatMoney(user.wallet_balance)}`,
  ];

  const insights = [
    completedGigs >= 4
      ? "Proof-of-work depth is strong enough to support premium matching and lending conversations."
      : "The next few verified gigs will materially strengthen this worker's identity and pricing power.",
    payoutTransactions.length > 0
      ? "Successful payouts are already creating a real transaction history beyond ratings alone."
      : "Linking completed gigs to payout rails will make this profile much more bankable.",
    user.wallet_balance >= 50000
      ? "Wallet liquidity suggests the worker can absorb smaller shocks without default risk rising."
      : "Improving wallet balance will strengthen cash-flow confidence for lenders.",
  ];

  const next_actions = [
    score >= 85
      ? "Route to working capital and equipment finance offers."
      : "Keep routing jobs that can be completed quickly and rated well.",
    payoutTransactions.length > 0
      ? "Surface payout history to lenders as evidence of consistent financial behavior."
      : "Encourage wallet payout and transfer usage to grow transaction signals.",
    averageRating && averageRating >= 4.5
      ? "Highlight this worker as a top-rated example of trust-led hiring."
      : "Prioritize higher-performing workers when surfacing trust-led hiring stories.",
  ];

  const summary =
    score >= 85
      ? "Strong work history, stable earnings, and visible financial behavior make this worker attractive to partner banks."
      : score >= 70
        ? "Consistent work completion is creating a bankable profile with room to grow into credit products."
        : score >= 55
          ? "The worker is building the early signals that lenders and savings providers look for."
          : "The worker is just starting to accumulate the proof needed for formal financial access.";

  return {
    score,
    tier,
    readiness,
    summary,
    signals,
    insights,
    next_actions,
    metrics: {
      trust: trustScore,
      completion: completionScore,
      earnings: earningsScore,
      liquidity: liquidityScore,
      rating: ratingScore,
      activity: activityScore,
    },
    offers: buildOffers(score, totalEarnings),
  };
}
