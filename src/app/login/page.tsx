"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setSession } from "@/lib/session";
import { formatMoney } from "@/lib/format";

type SeededUser = {
  id: string;
  name: string;
  role: "worker" | "employer";
  location?: string | null;
  bio?: string | null;
  skills?: string;
  trust_score: number;
  wallet_balance: number;
  virtual_account_number?: string | null;
  virtual_account_bank?: string | null;
};

export default function Login() {
  const router = useRouter();
  const [users, setUsers] = useState<SeededUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"worker" | "employer">("employer");

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((user) => user.role === role);

  const handlePick = (user: SeededUser) => {
    setSession(user.id, user.role);
    if (user.role === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push(`/worker/${user.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <Link href="/" className="btn-ghost px-0 py-0 text-sm text-slate-600">
            Back home
          </Link>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Sign in to Gigmark</p>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12 lg:py-16">
        <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_55%,rgba(255,237,213,0.75))]">
          <p className="section-kicker text-orange-600">Welcome back</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Are you here to hire, or here to work?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Choose the path that matches you. Workers land on their profile; employers land on the hiring dashboard.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-orange-200 bg-white p-1 shadow-sm">
            {(["worker", "employer"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setRole(option)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  role === option
                    ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {option === "worker" ? "I'm looking for work" : "I'm hiring"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="surface col-span-full border-orange-100 p-8 text-center text-slate-500">
              Loading accounts...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="surface col-span-full border-orange-100 p-8 text-center">
              <p className="text-lg font-semibold text-slate-950">No {role} accounts yet.</p>
              <p className="mt-2 text-sm text-slate-600">
                {role === "worker" ? (
                  <>Run the AI onboarding to create a worker profile. <Link href="/onboard" className="font-semibold text-orange-600 hover:text-orange-700">Start onboarding</Link></>
                ) : (
                  <>Set up an employer account first. <Link href="/employer/onboard" className="font-semibold text-orange-600 hover:text-orange-700">Create employer account</Link></>
                )}
              </p>
            </div>
          )}

          {filtered.map((user) => (
            <button
              key={user.id}
              onClick={() => handlePick(user)}
              className="feature-card text-left transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_24px_60px_rgba(249,115,22,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker text-orange-600">{user.role === "worker" ? "Worker" : "Employer"}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-950">{user.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{user.location || "Nigeria"}</p>
                </div>
                <div className="rounded-2xl bg-orange-500 px-3 py-2 text-right text-white shadow-[0_10px_22px_rgba(249,115,22,0.18)]">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-orange-100">Trust</p>
                  <p className="text-2xl font-bold">{user.trust_score}</p>
                </div>
              </div>
              {user.bio && <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{user.bio}</p>}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="uppercase tracking-[0.25em] text-slate-500">Wallet</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatMoney(user.wallet_balance)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="uppercase tracking-[0.25em] text-slate-500">Account</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-slate-950">{user.virtual_account_number || "—"}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Link href="/onboard" className="surface border-orange-100 p-6 transition hover:border-orange-200 hover:shadow-md">
            <p className="section-kicker text-orange-600">New worker?</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">Build your worker identity with AI</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              No CV needed. Answer a few prompts in text or voice and Gigmark builds your profile, trust score, and financial readiness.
            </p>
          </Link>
          <Link href="/employer/onboard" className="surface border-orange-100 p-6 transition hover:border-orange-200 hover:shadow-md">
            <p className="section-kicker text-orange-600">New employer?</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">Create a hiring account in under a minute</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Get a Gigmark wallet, your own escrow account number, and start posting funded gigs immediately.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
