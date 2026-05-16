"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { average, formatCompactMoney, formatMoney, titleCase } from "@/lib/format";

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  worker_id?: string | null;
  employer_id: string;
  employer_name?: string;
  escrow_locked: number;
  created_at: number;
}

interface User {
  id: string;
  name: string;
  role: "worker" | "employer";
  trust_score: number;
  wallet_balance: number;
  location?: string | null;
  bio?: string | null;
  virtual_account_number?: string | null;
  virtual_account_bank?: string | null;
}

export default function EmployerDashboard() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [gigsResponse, usersResponse] = await Promise.all([
          fetch("/api/gigs"),
          fetch("/api/users"),
        ]);

        const [gigsData, usersData] = await Promise.all([
          gigsResponse.json(),
          usersResponse.json(),
        ]);

        setGigs(gigsData);
        setUsers(usersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const workers = useMemo(
    () => users.filter((user) => user.role === "worker").sort((a, b) => b.trust_score - a.trust_score),
    [users]
  );
  const employers = useMemo(() => users.filter((user) => user.role === "employer"), [users]);
  const filteredGigs = useMemo(
    () => gigs.filter((gig) => filter === "all" || gig.status === filter),
    [filter, gigs]
  );

  const openGigs = gigs.filter((gig) => gig.status === "open");
  const assignedGigs = gigs.filter((gig) => gig.status === "assigned");
  const completedGigs = gigs.filter((gig) => gig.status === "completed");
  const fundedGigs = gigs.filter((gig) => gig.escrow_locked > 0);
  const totalEmployerWallet = employers.reduce((sum, e) => sum + (e.wallet_balance || 0), 0);
  const completionRate = gigs.length ? Math.round((completedGigs.length / gigs.length) * 100) : 0;
  const assignmentRate = gigs.length ? Math.round(((assignedGigs.length + completedGigs.length) / gigs.length) * 100) : 0;
  const totalBudget = gigs.reduce((sum, gig) => sum + gig.budget, 0);
  const activeEscrow = fundedGigs.reduce((sum, gig) => sum + gig.escrow_locked, 0);
  const averageBudget = gigs.length ? Math.round(average(gigs.map((gig) => gig.budget))) : 0;
  const trustAverage = workers.length ? Math.round(average(workers.map((worker) => worker.trust_score))) : 0;

  const spendByCategory = Object.entries(
    gigs.reduce<Record<string, number>>((acc, gig) => {
      acc[gig.category] = (acc[gig.category] || 0) + gig.budget;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const actionQueue = [...gigs]
    .sort((a, b) => {
      const priority = (gig: Gig) => {
        if (gig.status === "open" && gig.escrow_locked === 0) return 3;
        if (gig.status === "open") return 2;
        if (gig.status === "assigned") return 1;
        return 0;
      };

      return priority(b) - priority(a) || b.budget - a.budget;
    })
    .slice(0, 4);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="section-shell grid min-h-screen place-items-center">
          <div className="hero-shell max-w-xl text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            <p className="mt-4 text-lg font-semibold">Loading command center...</p>
            <p className="mt-2 text-sm text-slate-600">
              Pulling marketplace, trust, and payment signals into one view.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-[0_16px_40px_rgba(249,115,22,0.28)]">
              GM
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Employer command center</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">Marketplace operations dashboard</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-secondary">Home</Link>
            <Link href="/employer/post-gig" className="btn-primary bg-orange-500 hover:bg-orange-600">Post a gig</Link>
          </div>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-10">
        <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.92),rgba(255,255,255,1)_45%,rgba(255,237,213,0.72))]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-success bg-orange-50 text-orange-700 ring-orange-200">Live hiring pulse</span>
                <span className="badge-neutral">{workers.length} workers in network</span>
                <span className="badge-neutral">{employers.length} employers active</span>
              </div>
              <h2 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                What needs action, what is funded, and who is safest to hire.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Pipeline, trust, and Squad-powered escrow visibility in one place — so you can move from job creation to payout without guessing.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/employer/post-gig" className="btn-primary bg-orange-500 px-6 py-3 hover:bg-orange-600">
                  Launch a new gig
                </Link>
                <Link href="/employer/onboard" className="btn-secondary px-6 py-3">
                  Add employer account
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Wallet (all employers)", value: formatCompactMoney(totalEmployerWallet), copy: "Spendable balance across employer accounts on Gigmark." },
                { label: "Active escrow", value: formatCompactMoney(activeEscrow), copy: "Money already locked in escrow against live gigs." },
                { label: "Fill rate", value: `${assignmentRate}%`, copy: "Open jobs that already have a worker attached." },
                { label: "Completion rate", value: `${completionRate}%`, copy: "How much of the visible pipeline is already delivered." },
              ].map((metric) => (
                <div key={metric.label} className="metric border-orange-100">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-4xl font-semibold text-slate-950">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{metric.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {[
            { label: "Open gigs", value: openGigs.length, tone: "bg-orange-50 text-orange-700" },
            { label: "Assigned", value: assignedGigs.length, tone: "bg-amber-50 text-amber-700" },
            { label: "Completed", value: completedGigs.length, tone: "bg-emerald-50 text-emerald-700" },
            { label: "Average budget", value: formatCompactMoney(averageBudget), tone: "bg-slate-100 text-slate-700" },
            { label: "Worker trust avg", value: `${trustAverage}`, tone: "bg-orange-50 text-orange-700" },
            { label: "Payment rails", value: "Card + VA", tone: "bg-slate-100 text-slate-700" },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>{item.label}</span>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface border-orange-100 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker text-orange-600">Action queue</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">What needs attention next</h3>
              </div>
              <span className="badge-neutral">{actionQueue.length} priority items</span>
            </div>

            <div className="mt-6 space-y-4">
              {actionQueue.map((gig) => {
                const action =
                  gig.status === "open" && gig.escrow_locked === 0
                    ? "Fund escrow and shortlist workers"
                    : gig.status === "open"
                      ? "Shortlist workers"
                      : gig.status === "assigned"
                        ? "Complete work and release payout"
                        : "Review delivered work";

                return (
                  <Link key={gig.id} href={`/gig/${gig.id}`} className="block rounded-[1.25rem] border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-success bg-orange-50 text-orange-700 ring-orange-200">{titleCase(gig.category)}</span>
                          <span className="badge-neutral">{titleCase(gig.status)}</span>
                          {gig.escrow_locked > 0 && <span className="badge-warning">Escrow funded</span>}
                        </div>
                        <h4 className="mt-3 text-xl font-semibold text-slate-950">{gig.title}</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{gig.description}</p>
                        <p className="mt-3 text-sm font-medium text-orange-600">{action}</p>
                      </div>
                      <div className="min-w-[180px] rounded-2xl bg-slate-50 p-4 text-left md:text-right">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Budget</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(gig.budget)}</p>
                        <p className="mt-2 text-xs text-slate-500">{gig.employer_name || "Employer"}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Payments and trust</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">How Gigmark protects every hire</h3>
              <div className="mt-5 grid gap-3">
                {[
                  {
                    title: "Escrow visibility",
                    detail: `${fundedGigs.length} gigs have money protected before delivery starts.`,
                  },
                  {
                    title: "Dynamic virtual accounts",
                    detail: "Employers can fund by transfer or card — built for how money actually moves locally.",
                  },
                  {
                    title: "Proof becomes payout history",
                    detail: "Completed gigs feed worker payout records, not just ratings and profile text.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker text-orange-600">Trusted talent</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">Top worker radar</h3>
                </div>
                <span className="badge-neutral">Ranked by trust</span>
              </div>

              <div className="mt-5 space-y-3">
                {workers.slice(0, 4).map((worker) => (
                  <Link key={worker.id} href={`/worker/${worker.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-orange-200">
                    <div>
                      <p className="font-semibold text-slate-950">{worker.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{worker.location || "Nigeria"}{worker.bio ? ` · ${worker.bio}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Trust</p>
                      <p className="mt-1 text-2xl font-semibold text-orange-600">{worker.trust_score}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Employer accounts</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Permanent escrow accounts</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Every employer has a single dedicated account number. Top it up once and post as many gigs as you like — escrow comes straight from this wallet.
              </p>
              <div className="mt-4 space-y-3">
                {employers.map((employer) => (
                  <div key={employer.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">{employer.name}</p>
                      {employer.virtual_account_number ? (
                        <p className="mt-1 font-mono text-sm text-slate-700">{employer.virtual_account_number} <span className="text-slate-400">· {employer.virtual_account_bank}</span></p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">No account assigned yet</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Wallet</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">{formatCompactMoney(employer.wallet_balance)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface border-orange-100 p-6">
            <p className="section-kicker text-orange-600">Budget mix</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">Where demand is strongest</h3>
            <div className="mt-5 space-y-4">
              {spendByCategory.map(([category, value]) => {
                const width = totalBudget ? `${Math.max(12, Math.round((value / totalBudget) * 100))}%` : "12%";
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{titleCase(category)}</span>
                      <span className="text-slate-500">{formatMoney(value)}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface border-orange-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker text-orange-600">Pipeline</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">All gigs</h3>
              </div>
              <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                {[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "assigned", label: "Assigned" },
                  { value: "completed", label: "Completed" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setFilter(status.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filter === status.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {filteredGigs.length > 0 ? (
                filteredGigs.map((gig) => (
                  <Link key={gig.id} href={`/gig/${gig.id}`} className="block rounded-[1.25rem] border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-success bg-orange-50 text-orange-700 ring-orange-200">{titleCase(gig.category)}</span>
                          <span className="badge-neutral">{titleCase(gig.status)}</span>
                          <span className={`badge ${gig.escrow_locked > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                            {gig.escrow_locked > 0 ? "Funded" : "Awaiting funds"}
                          </span>
                        </div>
                        <h4 className="mt-3 text-lg font-semibold text-slate-950">{gig.title}</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{gig.description}</p>
                      </div>
                      <div className="min-w-[180px] rounded-2xl bg-slate-50 p-4 text-left md:text-right">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Budget</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(gig.budget)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <p className="text-lg font-semibold text-slate-950">No gigs in this category yet.</p>
                  <p className="mt-2 text-sm text-slate-600">Create a new gig to start building your hiring pipeline.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
