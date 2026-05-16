import { NextRequest, NextResponse } from "next/server";
import {
  buildAutoBio,
  defaultOnboardingProfile,
  getOnboardingStep,
  normalizeSkills,
  type OnboardingProfile,
  suggestedRepliesForStep,
} from "@/lib/onboarding";

type ChatRequest = {
  step: number;
  message: string;
  profile?: Partial<OnboardingProfile>;
};

type ChatResponse = {
  reply: string;
  updates: Partial<OnboardingProfile>;
  nextStep: number;
  complete: boolean;
  suggestedReplies: string[];
  draftBio: string;
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parsePhone(message: string): string {
  const match = message.match(/(\+?\d[\d\s()-]{7,}\d)/);
  return match ? cleanText(match[1]) : "";
}

function parseLocation(message: string): string {
  const segments = message.split(",").map((part) => cleanText(part)).filter(Boolean);
  if (segments.length >= 2) {
    return segments[segments.length - 1];
  }

  const locationMatch = message.match(/\b(lagos|abuja|kano|ibadan|port harcourt|remote)\b/i);
  return locationMatch ? cleanText(locationMatch[0]) : "";
}

function parseSkills(message: string): string[] {
  const lower = message.toLowerCase();
  const known = [
    "tailoring",
    "delivery",
    "graphic design",
    "plumbing",
    "tutoring",
    "repairs",
    "cleaning",
    "cooking",
    "photography",
    "writing",
    "translation",
    "accounting",
    "logistics",
    "rider",
    "designer",
    "technician",
    "fashion design",
  ];

  const picked = known.filter((skill) => lower.includes(skill));
  if (picked.length > 0) return normalizeSkills(picked);

  return normalizeSkills(
    message
      .split(/,| and |\//i)
      .map((item) => cleanText(item))
      .filter(Boolean)
      .slice(0, 4)
  );
}

function parseIncomeBand(message: string): string {
  const amount = message.match(/(\d[\d,]*)/);
  return amount ? amount[1].replace(/,/g, "") : "";
}

function nextPrompt(step: number, merged: OnboardingProfile) {
  const name = merged.name || "there";

  if (step === 1) {
    return `Nice to meet you, ${name}. What kind of work do you do most often?`;
  }

  if (step === 2) {
    return `Great. What should Gigmark help you unlock first for your ${merged.workType || "work"}?`;
  }

  if (step === 3) {
    return "Understood. How often do you work, and what does a normal month look like financially?";
  }

  if (step === 4) {
    return "Good signal. How do you prefer to receive money after each job?";
  }

  if (step === 5) {
    return "Perfect. Your draft profile is ready. Should I create it now, or do you want to edit anything first?";
  }

  return "Your profile summary is ready. If it looks right, create the account and we will open your worker profile.";
}

function buildFallbackReply(step: number, profile: OnboardingProfile, message: string): ChatResponse {
  const updates: Partial<OnboardingProfile> = {};
  const text = cleanText(message);

  if (step === 1) {
    const phone = parsePhone(text);
    const location = parseLocation(text);
    if (phone) updates.phone = phone;
    if (location) updates.location = location;
    const name = text
      .replace(phone, "")
      .replace(location, "")
      .replace(/[\-,]/g, " ")
      .trim();
    if (name && name.length > 1) updates.name = name;
  }

  if (step === 2) {
    const skills = parseSkills(text);
    if (skills.length > 0) {
      updates.skills = skills;
      updates.workType = skills[0];
    }
  }

  if (step === 3) updates.financialGoal = text;
  if (step === 4) {
    updates.workFrequency = text;
    const incomeBand = parseIncomeBand(text);
    if (incomeBand) updates.incomeBand = incomeBand;
  }
  if (step === 5) updates.payoutPreference = text;
  if (step === 6) updates.bio = buildAutoBio({ ...profile, ...updates });

  const merged = { ...defaultOnboardingProfile, ...profile, ...updates };
  const nextStep = Math.min(step + 1, 6);

  return {
    reply: nextPrompt(step, merged),
    updates,
    nextStep,
    complete: nextStep >= 6,
    suggestedReplies: suggestedRepliesForStep(nextStep, merged),
    draftBio: buildAutoBio(merged),
  };
}

async function generateAiReply(
  step: number,
  profile: OnboardingProfile,
  message: string
): Promise<ChatResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const config = getOnboardingStep(step);
  const prompt = [
    "You are Gigmark's onboarding assistant.",
    "Keep replies short, warm, and confidence-building.",
    "Ask only one question at a time and keep momentum high.",
    "Output valid JSON only with keys: reply, updates, nextStep, complete.",
    "The updates object may include: name, phone, location, language, bio, skills, workType, financialGoal, workFrequency, payoutPreference, incomeBand.",
    `Current step: ${step}.`,
    `Current question: ${config.question}`,
    `Profile so far: ${JSON.stringify(profile)}`,
    `User message: ${message}`,
    "If the user gives a clear answer, fill the relevant fields in updates and move to the next step.",
    "If the user is on the final step, make the reply a concise confirmation and set complete to true.",
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as Partial<ChatResponse>;
    const updates = parsed.updates || {};
    if (updates.skills && Array.isArray(updates.skills)) {
      updates.skills = normalizeSkills(updates.skills);
    }

    const merged = { ...defaultOnboardingProfile, ...profile, ...updates };
    const nextStep = typeof parsed.nextStep === "number" ? parsed.nextStep : Math.min(step + 1, 6);
    const complete = Boolean(parsed.complete) || nextStep >= 6;

    return {
      reply: cleanText(parsed.reply || nextPrompt(step, merged)),
      updates,
      nextStep: Math.min(nextStep, 6),
      complete,
      suggestedReplies: suggestedRepliesForStep(Math.min(nextStep, 6), merged),
      draftBio: buildAutoBio(merged),
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const step = Math.min(Math.max(body.step || 1, 1), 6);
    const profile = { ...defaultOnboardingProfile, ...(body.profile || {}) };
    const message = cleanText(body.message || "");

    if (!message) {
      const config = getOnboardingStep(step);
      return NextResponse.json({
        reply: config.question,
        updates: {},
        nextStep: step,
        complete: false,
        suggestedReplies: suggestedRepliesForStep(step, profile),
        draftBio: buildAutoBio(profile),
      } satisfies ChatResponse);
    }

    const aiResponse = await generateAiReply(step, profile, message);
    if (aiResponse) {
      return NextResponse.json(aiResponse);
    }

    return NextResponse.json(buildFallbackReply(step, profile, message));
  } catch {
    return NextResponse.json(
      {
        reply: "I hit a snag. Try sending a shorter answer and I will continue the onboarding.",
        updates: {},
        nextStep: 1,
        complete: false,
        suggestedReplies: suggestedRepliesForStep(1, defaultOnboardingProfile),
        draftBio: buildAutoBio(defaultOnboardingProfile),
      } satisfies ChatResponse,
      { status: 200 }
    );
  }
}
