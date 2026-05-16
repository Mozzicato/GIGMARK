"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildAutoBio,
  defaultOnboardingProfile,
  deriveOnboardingOffers,
  deriveOnboardingReadiness,
  deriveOnboardingSignals,
  normalizeSkills,
  type OnboardingMode,
  type OnboardingProfile,
} from "@/lib/onboarding";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type FlowStep =
  | "ask_name"
  | "ask_phone"
  | "ask_location"
  | "ask_work"
  | "ask_goal"
  | "ask_payout"
  | "review"
  | "creating"
  | "done";

const STEP_ORDER: FlowStep[] = [
  "ask_name",
  "ask_phone",
  "ask_location",
  "ask_work",
  "ask_goal",
  "ask_payout",
  "review",
];

const STEP_PROGRESS: Record<FlowStep, number> = {
  ask_name: 1,
  ask_phone: 2,
  ask_location: 3,
  ask_work: 4,
  ask_goal: 5,
  ask_payout: 6,
  review: 7,
  creating: 7,
  done: 7,
};

const QUICK_CHIPS: Partial<Record<FlowStep, string[]>> = {
  ask_work: ["Tailoring", "Delivery", "Graphic design", "Plumbing", "Tutoring", "Repairs"],
  ask_goal: ["Save more", "Borrow for tools", "Build credit", "Smooth cash flow"],
  ask_payout: ["Bank transfer", "Wallet", "Virtual account"],
  review: ["Yes, create my account", "Let me edit"],
};

const PROMPTS: Record<FlowStep, string> = {
  ask_name: "Hi! I'm Zola, the Gigmark onboarding assistant. What should I call you?",
  ask_phone: "Nice to meet you. What phone number should employers use to reach you?",
  ask_location: "Got it. Where are you based? Just the city is fine.",
  ask_work: "Lovely. What kind of work do you do most often?",
  ask_goal: "Got it. What's the main thing you want Gigmark to help you with?",
  ask_payout: "Almost done. How do you prefer to receive money after each gig?",
  review: "Quick summary before I create your account...",
  creating: "Creating your Gigmark account...",
  done: "All done.",
};

const PLACEHOLDERS: Record<FlowStep, string> = {
  ask_name: "e.g. Mubarak Salaudeen",
  ask_phone: "e.g. +2348012345678",
  ask_location: "e.g. Lagos",
  ask_work: "e.g. Tailoring and alterations",
  ask_goal: "e.g. Borrow for tools, save more, build credit...",
  ask_payout: "Bank transfer, wallet, or virtual account",
  review: "Type 'yes' to confirm, or what to edit.",
  creating: "",
  done: "",
};

function makeId() {
  return `m_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function parsePhone(raw: string): string {
  const match = raw.match(/(\+?\d[\d\s()-]{7,}\d)/);
  return match ? match[1].replace(/[^\d+]/g, "") : "";
}

function parseLocation(raw: string): string {
  const cleaned = raw.replace(/[.,!?]/g, " ").trim();
  const known = cleaned.match(/\b(lagos|abuja|kano|ibadan|port harcourt|enugu|jos|kaduna|benin|owerri|remote)\b/i);
  if (known) {
    const word = known[0].toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words[words.length - 1] || "Nigeria";
}

function parseWork(raw: string): { workType: string; skills: string[] } {
  const lower = raw.toLowerCase();
  const known = [
    "tailoring",
    "alterations",
    "delivery",
    "logistics",
    "graphic design",
    "branding",
    "plumbing",
    "repairs",
    "tutoring",
    "cleaning",
    "photography",
    "writing",
    "cooking",
    "design",
  ];
  const picked = known.filter((skill) => lower.includes(skill));
  if (picked.length > 0) {
    return { workType: picked[0], skills: normalizeSkills(picked) };
  }
  const guess = raw.trim().toLowerCase();
  return { workType: guess, skills: normalizeSkills([guess]) };
}

function partnerMentionForWork(workType: string): string | null {
  const w = workType.toLowerCase();
  if (w.includes("tailor") || w.includes("alteration")) {
    return "Quick heads-up — once you complete a few tailoring gigs on Gigmark, our GTBank partnership opens up an equipment-finance line for sewing machines and tools, up to ₦200,000. Worth knowing.";
  }
  if (w.includes("delivery") || w.includes("logistic") || w.includes("rider")) {
    return "Quick heads-up — riders and dispatch workers on Gigmark get fast-tracked into a daily payout wallet, plus a fuel-credit line through our GTBank partnership once trust score crosses 70.";
  }
  if (w.includes("design") || w.includes("brand") || w.includes("photo")) {
    return "Quick heads-up — once your trust score is in good shape, Gigmark partners with GTBank to surface a creator working-capital line for equipment and software.";
  }
  if (w.includes("tutor") || w.includes("teach")) {
    return "Quick heads-up — tutors on Gigmark with verified gigs unlock our GTBank partner savings-plan, designed for income that comes in monthly clusters.";
  }
  return "Once you start completing gigs on Gigmark, our GTBank partnership unlocks savings, credit, and equipment financing options based on your verified work history.";
}

function partnerMentionForGoal(goal: string): string | null {
  const g = goal.toLowerCase();
  if (g.includes("borrow") || g.includes("tool") || g.includes("equipment")) {
    return "Noted. Borrowing-for-tools is one of the strongest paths on Gigmark — three verified gigs plus a clean rating opens an equipment finance application with GTBank.";
  }
  if (g.includes("save")) {
    return "Smart. We'll route 5% of each gig payout into a Gigmark savings wallet by default — you can dial it up or down anytime from your profile.";
  }
  if (g.includes("credit") || g.includes("build")) {
    return "Got it. Every completed gig adds to your Gigmark credit history. Five verified gigs and a 4+ rating unlocks the partner credit pre-check with GTBank.";
  }
  if (g.includes("cash flow") || g.includes("advance")) {
    return "Got it. Once you have steady gig completions, our payout-acceleration path lets you draw against confirmed work before final release.";
  }
  return "Got it. We'll surface the right financial path as your gig history grows.";
}

export default function WorkerOnboard() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("ask_name");
  const [profile, setProfile] = useState<OnboardingProfile>({ ...defaultOnboardingProfile });
  const [messages, setMessages] = useState<Message[]>([
    { id: makeId(), role: "assistant", content: PROMPTS.ask_name },
  ]);
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "unsupported">("idle");
  const [createdUser, setCreatedUser] = useState<{
    id: string;
    name: string;
    virtual_account_number?: string | null;
    virtual_account_bank?: string | null;
    virtual_account_name?: string | null;
  } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const voiceMode = profile.mode === "voice";

  const offerCards = useMemo(() => deriveOnboardingOffers(profile), [profile]);
  const readiness = useMemo(() => deriveOnboardingReadiness(profile), [profile]);
  const signals = useMemo(() => deriveOnboardingSignals(profile), [profile]);
  const progress = Math.round((STEP_PROGRESS[step] / 7) * 100);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!voiceMode || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(last.content);
    utterance.lang = "en-NG";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [messages, voiceMode]);

  const pushBot = (content: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content }]);
  };

  const pushUser = (content: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content }]);
  };

  const advanceTo = (next: FlowStep) => {
    setStep(next);
    setTimeout(() => pushBot(PROMPTS[next]), 350);
  };

  const handleAnswer = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    pushUser(text);
    setInput("");

    if (step === "ask_name") {
      const name = text.replace(/[,.!?]/g, " ").trim();
      setProfile((prev) => ({ ...prev, name }));
      const firstName = name.split(" ")[0] || name;
      setTimeout(() => pushBot(`Lovely to meet you, ${firstName}.`), 250);
      setTimeout(() => advanceTo("ask_phone"), 800);
      return;
    }

    if (step === "ask_phone") {
      const phone = parsePhone(text) || text;
      setProfile((prev) => ({ ...prev, phone }));
      setTimeout(() => pushBot(`Saved — I'll use ${phone} as your contact number.`), 250);
      setTimeout(() => advanceTo("ask_location"), 900);
      return;
    }

    if (step === "ask_location") {
      const location = parseLocation(text);
      setProfile((prev) => ({ ...prev, location }));
      setTimeout(() => pushBot(`${location} — great, plenty of work in that area.`), 250);
      setTimeout(() => advanceTo("ask_work"), 900);
      return;
    }

    if (step === "ask_work") {
      const { workType, skills } = parseWork(text);
      setProfile((prev) => ({ ...prev, workType, skills }));
      setTimeout(
        () => pushBot(`Noted — I've got ${workType}${skills.length > 1 ? ` and ${skills.length - 1} related skill${skills.length - 1 === 1 ? "" : "s"}` : ""}.`),
        250
      );
      const mention = partnerMentionForWork(workType);
      if (mention) setTimeout(() => pushBot(mention), 1100);
      setTimeout(() => advanceTo("ask_goal"), mention ? 2200 : 900);
      return;
    }

    if (step === "ask_goal") {
      setProfile((prev) => ({ ...prev, financialGoal: text }));
      const mention = partnerMentionForGoal(text);
      if (mention) setTimeout(() => pushBot(mention), 250);
      setTimeout(() => advanceTo("ask_payout"), mention ? 1500 : 600);
      return;
    }

    if (step === "ask_payout") {
      setProfile((prev) => ({ ...prev, payoutPreference: text }));
      setTimeout(() => pushBot(`Got it — ${text}.`), 250);
      setTimeout(() => {
        setStep("review");
        const summary = `Here's what I have:\n· Name: ${profile.name}\n· Phone: ${profile.phone}\n· Location: ${profile.location}\n· Work: ${profile.workType}\n· Goal: ${profile.financialGoal}\n· Payout: ${text}\n\nReady for me to create your account?`;
        pushBot(summary);
      }, 1000);
      return;
    }

    if (step === "review") {
      const lower = text.toLowerCase();
      if (lower.includes("edit") || lower.includes("change") || lower === "no") {
        setTimeout(
          () => pushBot("No problem — tell me which field to change and the new value. e.g. 'name to Adaeze' or 'goal to save more'."),
          250
        );
        return;
      }
      void handleCreateAccount();
      return;
    }
  };

  const handleCreateAccount = async () => {
    if (!profile.name) {
      setError("I still need your name. Let me know who you are first.");
      return;
    }
    if (!profile.phone) {
      setError("I still need a phone number employers can use to reach you.");
      return;
    }
    setError(null);
    setCreating(true);
    setStep("creating");
    pushBot("Creating your Gigmark account now...");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profile.phone,
          name: profile.name,
          role: "worker",
          location: profile.location || null,
          language: profile.language || "en",
          bio: buildAutoBio(profile),
          skills: profile.skills,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }
      setCreatedUser(data);
      setStep("done");
      const firstName = (data.name || profile.name).split(" ")[0];
      pushBot(
        `🎉 Congratulations, ${firstName}! You're officially on Gigmark.\n\nYour permanent virtual account is ${data.virtual_account_number} (${data.virtual_account_bank}), in the name of ${data.virtual_account_name}.\n\nYou can start accepting gigs right now.`
      );
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
      setStep("review");
      pushBot(`Hmm, I couldn't create the account just yet: ${message}. Want me to try again?`);
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    handleAnswer(input);
  };

  const handleChip = (chip: string) => {
    handleAnswer(chip);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceState("unsupported");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-NG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceState("listening");
    recognition.onerror = () => setVoiceState("idle");
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      handleAnswer(transcript);
    };
    recognition.onend = () => setVoiceState("idle");
    recognition.start();
  };

  const isInputDisabled = step === "creating" || step === "done";
  const chips = QUICK_CHIPS[step] || [];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn-ghost px-0 py-0 text-sm text-slate-600">
              Back home
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">AI onboarding</p>
              <p className="text-sm text-slate-600">Chat with Zola. Text or voice. Built like a real conversation.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["text", "voice"] as OnboardingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setProfile((prev) => ({ ...prev, mode }))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  profile.mode === mode
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-slate-950"
                }`}
              >
                {mode === "text" ? "Text first" : "Voice first"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12 lg:py-16">
        {step === "done" && createdUser ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_55%,rgba(255,237,213,0.75))]">
              <p className="section-kicker text-orange-600">Welcome to Gigmark</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                🎉 Congratulations, {createdUser.name.split(" ")[0]}!
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                You&apos;ve been onboarded successfully. Your living CV starts from this moment. Every gig you complete builds your trust score, earnings record, and financial readiness.
              </p>

              <div className="mt-8 rounded-[1.75rem] border-2 border-orange-200 bg-white p-6 shadow-[0_18px_40px_rgba(249,115,22,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-700">Your permanent virtual account</p>
                <p className="mt-3 font-mono text-4xl font-bold text-slate-950">{createdUser.virtual_account_number || "—"}</p>
                <p className="mt-2 text-sm text-slate-600">{createdUser.virtual_account_bank} · {createdUser.virtual_account_name}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  This account is yours, permanently. Every gig you finish pays out here.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/worker/${createdUser.id}`}
                  className="btn-primary bg-orange-500 px-6 py-3 text-base hover:bg-orange-600"
                >
                  View my profile
                </Link>
                <Link
                  href="/employer/dashboard"
                  className="btn-secondary px-6 py-3 text-base"
                >
                  Browse open gigs
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">What unlocks next</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">After 1 verified gig</p>
                    <p>Your trust score starts moving. Employers can see you&apos;ve been vouched for.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">After 3 verified gigs</p>
                    <p>Equipment finance pre-check with our GTBank partnership opens up.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">After 5 verified gigs</p>
                    <p>Full credit readiness profile — savings, working capital, advance products surface automatically.</p>
                  </div>
                </div>
              </div>

              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">Pro tip</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Download your CV anytime from your profile. It&apos;s a verified PDF you can show landlords, banks, and microfinance partners.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <div className="space-y-6">
              <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_55%,rgba(255,237,213,0.75))]">
                <p className="section-kicker text-orange-600">No CV required</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                      Chat with Zola to join Gigmark.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                      A real conversation — short, friendly, and stress-free. Type your answers or speak them. Zola will confirm everything before creating your account.
                    </p>
                  </div>
                  <div className="rounded-[1.75rem] border border-orange-100 bg-white px-5 py-4 text-right shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Readiness</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">{readiness.score}%</p>
                    <p className="mt-1 text-sm text-orange-600">{readiness.label}</p>
                  </div>
                </div>

                <div className="mt-6 h-2 rounded-full bg-orange-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="surface border-orange-100 p-5 sm:p-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker text-orange-600">Conversation</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{step === "review" ? "One last check" : "Tell Zola about your work"}</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${creating ? "bg-amber-400" : "bg-emerald-500"}`} />
                    {creating ? "Creating" : "Ready"}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 sm:p-6">
                  <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[90%] whitespace-pre-line rounded-[1.5rem] px-4 py-3 text-sm leading-7 sm:max-w-[78%] ${
                            message.role === "assistant"
                              ? "border border-white/10 bg-white/5 text-white"
                              : "bg-orange-500 text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)]"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {chips.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChip(chip)}
                        disabled={isInputDisabled}
                        className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                    rows={2}
                    placeholder={PLACEHOLDERS[step]}
                    disabled={isInputDisabled}
                    className="textarea-field"
                  />
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    disabled={isInputDisabled}
                    className={`btn-secondary px-5 py-3 ${voiceState === "listening" ? "ring-2 ring-orange-200" : ""}`}
                  >
                    {voiceState === "listening" ? "Listening..." : "Voice"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isInputDisabled || !input.trim()}
                    className="btn-primary bg-orange-500 px-6 py-3 hover:bg-orange-600"
                  >
                    {step === "review" ? "Confirm" : "Send"}
                  </button>
                </div>

                {step === "review" && (
                  <button
                    type="button"
                    onClick={() => void handleCreateAccount()}
                    disabled={creating || !profile.name || !profile.phone}
                    className="btn-primary mt-3 w-full bg-emerald-600 px-6 py-3 hover:bg-emerald-700"
                  >
                    {creating ? "Creating account..." : "Yes, create my Gigmark account"}
                  </button>
                )}

                {error && (
                  <p className="mt-3 text-sm text-rose-600">{error}</p>
                )}
                {voiceState === "unsupported" && (
                  <p className="mt-3 text-sm text-slate-500">Voice input not supported in this browser — text works just fine.</p>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">Identity signals</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">What Gigmark already understands</h3>
                <div className="mt-5 space-y-3">
                  {signals.map((signal) => (
                    <div key={signal.label} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{signal.label}</p>
                        <span className="badge-neutral">{signal.value}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{signal.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">Financial fit</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">What this profile may unlock</h3>
                <div className="mt-4 space-y-3">
                  {offerCards.slice(0, 2).map((offer) => (
                    <div key={offer.id} className={`rounded-[1.5rem] border border-orange-100 bg-gradient-to-br ${offer.accent} p-4`}>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{offer.provider}</p>
                      <p className="mt-1 text-base font-bold text-slate-950">{offer.title}</p>
                      <p className="mt-2 text-xs leading-6 text-slate-700">{offer.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
