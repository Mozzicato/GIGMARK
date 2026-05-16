"use client";

import { use, useEffect, useState } from "react";
import { formatCompactMoney, formatDate, formatMoney } from "@/lib/format";

interface CvData {
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
  };
}

export default function WorkerCv({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [data, setData] = useState<CvData | null>(null);

  useEffect(() => {
    fetch(`/api/users/${resolvedParams.id}/stats`)
      .then((response) => response.json())
      .then(setData);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") window.print();
    }, 400);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data) {
    return (
      <main className="min-h-screen bg-white p-12 text-slate-900">
        <p>Preparing CV...</p>
      </main>
    );
  }

  const { user, stats, recent_gigs, financial_profile } = data;
  const skills: string[] = (() => {
    try {
      return JSON.parse(user.skills || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <main className="cv-shell mx-auto max-w-[820px] bg-white p-10 text-slate-900 print:p-8">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          .cv-no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="cv-no-print mb-6 flex items-center justify-between">
        <a href={`/worker/${user.id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
          ← Back to profile
        </a>
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Print / Save as PDF
        </button>
      </div>

      <header className="border-b-2 border-orange-500 pb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-orange-600">Gigmark proof-of-work CV</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{user.name}</h1>
        <p className="mt-2 text-base text-slate-600">{user.location || "Nigeria"} · {user.bio}</p>
        <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Trust score</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{stats.trust_score}/100</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Verified gigs</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{stats.completed_gigs}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Avg rating</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{stats.average_rating ? stats.average_rating.toFixed(1) : "—"}</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Earnings</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatCompactMoney(stats.total_earnings)}</p>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600">Professional summary</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          {financial_profile.summary} {financial_profile.readiness}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600">Skills</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600">Verified work history</h2>
        <div className="mt-3 space-y-4">
          {recent_gigs.length === 0 && (
            <p className="text-sm text-slate-500">No completed gigs yet.</p>
          )}
          {recent_gigs.map((gig) => (
            <div key={gig.id} className="border-l-2 border-orange-500 pl-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-950">{gig.title}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {formatDate(gig.completed_at)} · {formatMoney(gig.budget)}
                  {gig.rating ? ` · ${gig.rating}/5` : ""}
                </p>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-700">{gig.description}</p>
              {gig.feedback && (
                <p className="mt-1 text-sm italic leading-6 text-slate-600">&ldquo;{gig.feedback}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600">Financial readiness</h2>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Readiness tier</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{financial_profile.tier}</p>
            <p className="mt-1 text-sm text-slate-600">Score {financial_profile.score}/100</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signals</p>
            <ul className="mt-1 space-y-1 text-sm leading-6 text-slate-700">
              {financial_profile.signals.slice(0, 3).map((signal) => (
                <li key={signal}>• {signal}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {user.virtual_account_number && (
        <section className="mt-6 rounded-md border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verified payout account</p>
          <p className="mt-1 font-mono text-base font-semibold text-slate-950">{user.virtual_account_number}</p>
          <p className="text-xs text-slate-500">{user.virtual_account_bank} · Issued by Gigmark</p>
        </section>
      )}

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Generated by Gigmark · This CV is backed by verified gig history on the Gigmark trust layer · gigmark.app/worker/{user.id}
      </footer>
    </main>
  );
}
