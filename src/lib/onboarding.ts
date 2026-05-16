export type OnboardingMode = "text" | "voice";

export type OnboardingProfile = {
  name: string;
  phone: string;
  location: string;
  language: string;
  bio: string;
  skills: string[];
  workType: string;
  financialGoal: string;
  workFrequency: string;
  payoutPreference: string;
  incomeBand: string;
  mode: OnboardingMode;
};

export type OnboardingOffer = {
  id: string;
  title: string;
  provider: string;
  description: string;
  fitReason: string;
  action: string;
  accent: string;
};

export type OnboardingStep = {
  step: number;
  title: string;
  question: string;
  helper: string;
  placeholder: string;
  chips: string[];
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 1,
    title: "Introduce yourself",
    question: "What should I call you, and what number should Gigmark use to reach you?",
    helper: "One line is enough. You can include your location too.",
    placeholder: "Amara Okafor, +234..., Lagos",
    chips: [],
  },
  {
    step: 2,
    title: "Your work",
    question: "What kind of work do you do most often?",
    helper: "Pick the skill that best describes how you already earn money.",
    placeholder: "Tailoring, delivery, design, tutoring...",
    chips: ["tailoring", "delivery", "graphic design", "tutoring", "plumbing", "repair"],
  },
  {
    step: 3,
    title: "Financial goal",
    question: "What do you want Gigmark to help you unlock first?",
    helper: "This helps us suggest the best savings, credit, and banking path.",
    placeholder: "Save more, borrow for tools, build credit...",
    chips: ["Save more", "Borrow for tools", "Build credit", "Access insurance", "Smooth cash flow"],
  },
  {
    step: 4,
    title: "Work rhythm",
    question: "How often do you work, and what does a normal month look like?",
    helper: "Short answers are fine. The AI will keep it simple.",
    placeholder: "Daily, weekly, or a few times a month; roughly how much you earn",
    chips: ["Daily", "3-5 days/week", "Weekly", "Occasionally"],
  },
  {
    step: 5,
    title: "Payout preference",
    question: "How do you prefer to receive money after a job?",
    helper: "We use this to guide wallet, bank transfer, and virtual account options.",
    placeholder: "Bank transfer, wallet, virtual account...",
    chips: ["Bank transfer", "Wallet", "Virtual account", "Both"],
  },
  {
    step: 6,
    title: "Review and confirm",
    question: "Looks good. Should I create your profile now?",
    helper: "You can still edit the summary before we submit.",
    placeholder: "Type yes to continue, or tell me what to edit.",
    chips: ["Create profile", "Edit summary", "Change skills", "Change goal"],
  },
];

export const defaultOnboardingProfile: OnboardingProfile = {
  name: "",
  phone: "",
  location: "",
  language: "en",
  bio: "",
  skills: [],
  workType: "",
  financialGoal: "",
  workFrequency: "",
  payoutPreference: "",
  incomeBand: "",
  mode: "text",
};

export function getOnboardingStep(step: number): OnboardingStep {
  return ONBOARDING_STEPS[Math.min(Math.max(step, 1), ONBOARDING_STEPS.length) - 1];
}

export function suggestedRepliesForStep(step: number, profile: OnboardingProfile): string[] {
  const config = getOnboardingStep(step);
  if (config.chips.length > 0) return config.chips;

  if (step === 1) return ["Amaka, +234..., Lagos", "I prefer text", "I prefer voice"];
  if (step === 6) return ["Create profile", "Edit summary", "Change goal"];
  return profile.mode === "voice"
    ? ["Speak to continue", "Type my answer", "Use the suggested options"]
    : ["Use the suggested options", "Keep it short", "I will type it"];
}

export function normalizeSkills(skills: string[]): string[] {
  return Array.from(
    new Set(
      skills
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function buildAutoBio(profile: OnboardingProfile): string {
  const name = profile.name || "This worker";
  const work = profile.workType || profile.skills[0] || "service professional";
  const location = profile.location || "Nigeria";
  const goal = profile.financialGoal || "build stronger financial trust";
  const pace = profile.workFrequency || "an active workflow";

  return `${name} is a ${work} professional based in ${location}. They use Gigmark to turn completed work into verified proof-of-work, grow trust through ${pace.toLowerCase()}, and move toward ${goal.toLowerCase()}.`;
}

export function deriveOnboardingSignals(profile: OnboardingProfile) {
  const offers = deriveOnboardingOffers(profile);
  return [
    {
      label: "Identity strength",
      value: profile.name && profile.workType ? "Structured" : "Forming",
      detail: profile.name && profile.workType
        ? "Core identity fields are strong enough to create a credible worker profile."
        : "We are still collecting the minimum inputs needed for a trustworthy profile.",
    },
    {
      label: "Best first product",
      value: offers[0]?.title || "Pending",
      detail: offers[0]?.fitReason || "Complete more onboarding steps to rank the best financial path.",
    },
    {
      label: "Preferred rail",
      value: profile.payoutPreference || "Not chosen",
      detail: profile.payoutPreference
        ? "This helps Gigmark decide whether to route funds into wallet, transfer, or virtual account flows."
        : "Choosing a payout preference improves how quickly payouts can become transaction history.",
    },
  ];
}

export function deriveOnboardingReadiness(profile: OnboardingProfile) {
  const signals = [
    profile.name ? 1 : 0,
    profile.phone ? 1 : 0,
    profile.workType ? 1 : 0,
    profile.financialGoal ? 1 : 0,
    profile.workFrequency ? 1 : 0,
    profile.payoutPreference ? 1 : 0,
  ];

  const score = Math.round((signals.reduce((sum, value) => sum + value, 0) / signals.length) * 100);

  return {
    score,
    label:
      score >= 85
        ? "Launch ready"
        : score >= 60
          ? "Strong draft"
          : score >= 40
            ? "Taking shape"
            : "Getting started",
  };
}

export function deriveOnboardingOffers(profile: OnboardingProfile): OnboardingOffer[] {
  const goal = profile.financialGoal.toLowerCase();
  const work = profile.workType.toLowerCase();
  const payout = profile.payoutPreference.toLowerCase();
  const frequency = profile.workFrequency.toLowerCase();
  const income = profile.incomeBand.toLowerCase();

  const offers: OnboardingOffer[] = [
    {
      id: "wallet-starter",
      title: "Savings starter wallet",
      provider: "Gigmark wallet rail",
      description: "A structured wallet that turns gig income into trackable financial history.",
      fitReason: "Best for new users who want a clean first step into money management.",
      action: "Set up wallet",
      accent: "from-orange-100 via-white to-amber-50",
    },
    {
      id: "micro-credit",
      title: "Micro-credit pre-check",
      provider: "Credit readiness path",
      description: "A lightweight credit path for transport, materials, and emergency working capital.",
      fitReason: "Useful when the worker wants to borrow for day-to-day work expenses.",
      action: "Check eligibility",
      accent: "from-orange-50 via-white to-slate-50",
    },
    {
      id: "equipment-finance",
      title: "Equipment finance",
      provider: "Growth tools path",
      description: "Helps workers finance tools that improve earning capacity over time.",
      fitReason: "Strong fit for artisans, riders, tailors, and technicians.",
      action: "View options",
      accent: "from-amber-100 via-white to-orange-50",
    },
    {
      id: "income-advance",
      title: "Income advance",
      provider: "Payout acceleration path",
      description: "A future-ready way to unlock cash once work is confirmed.",
      fitReason: "Best for workers with repeat jobs and frequent payouts.",
      action: "Learn more",
      accent: "from-emerald-50 via-white to-orange-50",
    },
    {
      id: "insurance-ready",
      title: "Insurance readiness",
      provider: "Protection path",
      description: "An eventual path into work protection, health cover, or device protection.",
      fitReason: "A good fit for workers who want more stability while they grow.",
      action: "See cover path",
      accent: "from-rose-50 via-white to-orange-50",
    },
  ];

  const scores = new Map<string, number>(offers.map((offer) => [offer.id, 0]));
  const boost = (id: string, amount: number) => scores.set(id, (scores.get(id) || 0) + amount);

  if (goal.includes("save")) boost("wallet-starter", 5);
  if (goal.includes("credit") || goal.includes("borrow")) boost("micro-credit", 5);
  if (goal.includes("tool") || goal.includes("equipment") || goal.includes("grow")) boost("equipment-finance", 5);
  if (goal.includes("cash flow") || goal.includes("advance") || goal.includes("smooth")) boost("income-advance", 5);
  if (goal.includes("insurance") || goal.includes("protect")) boost("insurance-ready", 5);

  if (
    work.includes("tailor") ||
    work.includes("design") ||
    work.includes("repair") ||
    work.includes("plumb") ||
    work.includes("tech")
  ) {
    boost("equipment-finance", 4);
  }
  if (work.includes("delivery") || work.includes("rider") || work.includes("logistics")) {
    boost("micro-credit", 4);
    boost("income-advance", 2);
  }
  if (work.includes("tutor") || work.includes("writer") || work.includes("translator")) {
    boost("income-advance", 3);
    boost("wallet-starter", 2);
  }

  if (payout.includes("wallet") || payout.includes("bank") || payout.includes("transfer")) {
    boost("wallet-starter", 3);
  }
  if (payout.includes("virtual")) {
    boost("income-advance", 2);
  }
  if (frequency.includes("daily") || frequency.includes("weekly") || frequency.includes("3-5")) {
    boost("income-advance", 2);
    boost("micro-credit", 2);
  }
  if (income.includes("50") || income.includes("100") || income.includes("200")) {
    boost("wallet-starter", 2);
  }

  return offers
    .map((offer) => ({ ...offer, _score: scores.get(offer.id) || 0 }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 4)
    .map(({ _score, ...offer }) => offer);
}
