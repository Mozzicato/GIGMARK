"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { formatCompactMoney, formatDate, formatMoney } from "@/lib/format";

interface UserData {
  user: {
    id: string;
    name: string;
    role: string;
    bio: string;
    location?: string | null;
    skills: string;
    virtual_account_number?: string | null;
    virtual_account_bank?: string | null;
  };
  stats: {
    completed_gigs: number;
    average_rating: number | null;
    total_earnings: number;
    trust_score: number;
    wallet_balance: number;
    transaction_count: number;
  };
  recent_gigs: Array<{
    id: string;
    title: string;
    description: string;
    budget: number;
    completed_at: number | null;
    rating?: number | null;
    feedback?: string | null;
  }>;
  financial_profile: {
    score: number;
    tier: string;
    summary: string;
    readiness: string;
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
    offers: Array<{
      id: string;
      provider: string;
      title: string;
      description: string;
      eligibility: string;
      action: string;
    }>;
  };
}

export default function WorkerProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${resolvedParams.id}/stats`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="section-shell grid min-h-screen place-items-center">
          <div className="hero-shell max-w-xl text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            <p className="mt-4 text-lg font-semibold">Loading worker identity...</p>
            <p className="mt-2 text-sm text-slate-600">Assembling proof-of-work, payouts, and trust signals.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="section-shell grid min-h-screen place-items-center">
          <div className="hero-shell max-w-xl text-center">
            <h1 className="text-3xl font-bold">Worker not found</h1>
            <p className="mt-3 text-sm text-slate-600">The profile may not exist yet or the URL is stale.</p>
            <Link href="/" className="btn-primary mt-6 bg-orange-500 px-6 py-3 hover:bg-orange-600">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  const { user, stats, recent_gigs, financial_profile } = data;
  const parsedSkills = JSON.parse(user.skills || "[]") as string[];
  const firstName = user.name.split(" ")[0];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <Link href="/" className="btn-ghost px-0 py-0 text-sm text-slate-600">Back home</Link>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs uppercase tracking-[0.35em] text-orange-600 sm:block">Worker identity</p>
            <Link
              href={`/worker/${user.id}/cv`}
              className="btn-primary bg-orange-500 px-4 py-2 text-xs hover:bg-orange-600"
            >
              Download CV
            </Link>
          </div>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12">
        <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_55%,rgba(255,237,213,0.75))]">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="flex items-start gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-orange-500 text-3xl font-bold text-white shadow-[0_18px_40px_rgba(249,115,22,0.24)]">
                {firstName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="section-kicker text-orange-600">Proof-of-work profile</p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  {user.name}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{user.bio}</p>

                {stats.completed_gigs > 0 && (
                  <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Professional summary</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {user.name} has {stats.completed_gigs} verified gig{stats.completed_gigs === 1 ? "" : "s"}, an average rating of{" "}
                      {stats.average_rating ? stats.average_rating.toFixed(1) : "-"} out of 5, and {formatCompactMoney(stats.total_earnings)} in tracked earnings.
                      Their trust score is {stats.trust_score}/100 — a verified economic identity built from real completed work.
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="badge-neutral">{user.role === "worker" ? "Worker" : "Employer"}</span>
                  <span className="badge-neutral">{user.location || "Nigeria"}</span>
                  <span className="badge-neutral">{stats.transaction_count} payout-linked records</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Trust score", value: `${stats.trust_score}`, copy: "Behavioral confidence from work quality and follow-through." },
                { label: "Average rating", value: stats.average_rating ? stats.average_rating.toFixed(1) : "-", copy: "How employers experience this worker in practice." },
                { label: "Completed gigs", value: `${stats.completed_gigs}`, copy: "Verified work history instead of a manually written CV." },
                { label: "Verified earnings", value: formatCompactMoney(stats.total_earnings), copy: "Income trail that can support savings and credit pathways." },
              ].map((metric) => (
                <div key={metric.label} className="metric border-orange-100">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{metric.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="hero-shell border-orange-100 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-kicker text-orange-600">Financial twin</p>
                <h2 className="section-title mt-2">Financial readiness score</h2>
              </div>
              <div className="rounded-[1.75rem] bg-orange-500 px-5 py-4 text-right text-white shadow-[0_18px_34px_rgba(249,115,22,0.22)]">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-100">Score</p>
                <p className="mt-2 text-4xl font-bold">{financial_profile.score}</p>
                <p className="mt-1 text-sm text-orange-100">{financial_profile.tier}</p>
              </div>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{financial_profile.summary}</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{financial_profile.readiness}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {financial_profile.signals.map((signal) => (
                <div key={signal} className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm text-slate-700">
                  {signal}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Trust", value: financial_profile.metrics.trust },
                { label: "Completion", value: financial_profile.metrics.completion },
                { label: "Liquidity", value: financial_profile.metrics.liquidity },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{metric.value}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface border-orange-100 p-6 sm:p-8">
            <p className="section-kicker text-orange-600">What stands out</p>
            <h3 className="section-title mt-2">Signals a bank or lender can understand</h3>

            <div className="mt-5 space-y-4">
              {financial_profile.insights.map((insight) => (
                <div key={insight} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                  <p className="text-sm leading-7 text-slate-700">{insight}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Next best moves</p>
              <div className="mt-3 space-y-3">
                {financial_profile.next_actions.map((action) => (
                  <div key={action} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">+</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface border-orange-100 p-6 sm:p-8">
            <p className="section-kicker text-orange-600">Skills and wallet</p>
            <h3 className="section-title mt-2">Portable reputation building blocks</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {parsedSkills.map((skill, index) => (
                <span key={`${skill}-${index}`} className="badge-success bg-orange-50 text-orange-700 ring-orange-200">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-[linear-gradient(160deg,#ffffff,#fff7ed)] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Payout account</p>
                <p className="mt-2 font-mono text-xl font-semibold text-slate-950">{user.virtual_account_number || "—"}</p>
                <p className="mt-1 text-sm text-slate-600">{user.virtual_account_bank || "Pending bank assignment"} · Permanent</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Wallet balance</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(stats.wallet_balance)}</p>
                <p className="mt-2 text-sm text-slate-600">Grows automatically when verified gigs are completed and escrow is released.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Transaction depth</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{stats.transaction_count}</p>
                <p className="mt-2 text-sm text-slate-600">Payout and escrow records add financial evidence beyond ratings.</p>
              </div>
            </div>
          </div>

          <div className="surface border-orange-100 p-6 sm:p-8">
            <p className="section-kicker text-orange-600">Specialized offers</p>
            <h3 className="section-title mt-2">What this profile can unlock next</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Verified work turns into financial visibility — savings, credit, and growth products this worker is eligible for.
            </p>

            <div className="mt-5 space-y-4">
              {financial_profile.offers.map((offer) => (
                <div key={offer.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{offer.provider}</p>
                      <h4 className="mt-2 text-lg font-bold text-slate-950">{offer.title}</h4>
                    </div>
                    <span className="badge-neutral">Next step</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{offer.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">Eligibility</p>
                  <p className="mt-1 text-sm leading-7 text-slate-700">{offer.eligibility}</p>
                  <button className="btn-secondary mt-4 w-full">{offer.action}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker text-orange-600">Living CV</p>
            <h2 className="section-title mt-2">Proof-of-work timeline</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Every entry below is a verified job — escrow-funded, completed, and rated. This is what replaces a paper CV.
            </p>
          </div>
          <Link
            href={`/worker/${user.id}/cv`}
            className="btn-secondary border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            Download CV
          </Link>
        </div>

        {recent_gigs.length > 0 ? (
          <div className="relative mt-8 space-y-5 pl-6 sm:pl-10">
            <div className="absolute left-2 top-0 h-full w-[2px] bg-gradient-to-b from-orange-400 via-orange-200 to-transparent sm:left-4" aria-hidden />
            {recent_gigs.map((gig, index) => (
              <div key={gig.id} className="relative">
                <div className="absolute -left-[18px] top-6 hidden h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-[0_10px_24px_rgba(249,115,22,0.32)] sm:flex">
                  {recent_gigs.length - index}
                </div>
                <div className="absolute -left-[10px] top-7 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-orange-100 sm:hidden" aria-hidden />
                <Link
                  href={`/gig/${gig.id}`}
                  className="surface block border-orange-100 p-6 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_24px_60px_rgba(249,115,22,0.12)]"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                        {gig.rating && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            {"★".repeat(gig.rating)}{"☆".repeat(5 - gig.rating)} {gig.rating}/5
                          </span>
                        )}
                        <span className="badge-neutral">{formatDate(gig.completed_at)}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{gig.title}</h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{gig.description}</p>
                      {gig.feedback && (
                        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                          <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Employer feedback</p>
                          <p className="mt-2 text-sm italic leading-7 text-slate-700">&ldquo;{gig.feedback}&rdquo;</p>
                        </div>
                      )}
                    </div>
                    <div className="min-w-[180px] rounded-[1.25rem] border border-orange-100 bg-[linear-gradient(160deg,#ffffff,#fff7ed)] p-5 text-left shadow-sm lg:text-right">
                      <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Gig value</p>
                      <p className="mt-2 text-3xl font-bold text-slate-950">{formatMoney(gig.budget)}</p>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Escrow released</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface mt-6 border-orange-100 p-8 text-center text-slate-600">
            <p className="text-lg font-semibold text-slate-950">No completed gigs yet.</p>
            <p className="mt-2 text-sm">Once gigs are funded and delivered, they appear here as verified proof-of-work entries.</p>
          </div>
        )}
      </section>

      <section className="section-shell py-8 pb-12">
        <div className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(120deg,rgba(249,115,22,0.08),rgba(255,255,255,1),rgba(251,191,36,0.12))] p-8 text-center">
          <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Interested in working with {firstName}?
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Work becomes identity, identity becomes trust, and trust becomes opportunity.
          </p>
          <Link href="/employer/dashboard" className="btn-primary mt-6 bg-orange-500 px-6 py-3 text-base hover:bg-orange-600">
            Explore the hiring dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
