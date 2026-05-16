"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, titleCase } from "@/lib/format";

const CATEGORIES = [
  "tailoring",
  "delivery",
  "graphic design",
  "plumbing",
  "tutoring",
  "repairs",
  "cleaning",
  "other",
];

type Employer = {
  id: string;
  name: string;
  role: "worker" | "employer";
  wallet_balance: number;
  virtual_account_number?: string | null;
  virtual_account_bank?: string | null;
};

export default function PostGig() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employerId, setEmployerId] = useState("");
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [postError, setPostError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    budget: "",
    location: "Remote",
    required_skills: [] as string[],
  });

  const activeEmployer = useMemo(
    () => employers.find((employer) => employer.id === employerId) || null,
    [employers, employerId]
  );

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then((users) => {
        const nextEmployers = (users as Employer[]).filter((user) => user.role === "employer");
        setEmployers(nextEmployers);
        if (nextEmployers[0]) {
          setEmployerId(nextEmployers[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const budget = Number(formData.budget || 0);
  const walletBalance = activeEmployer?.wallet_balance ?? 0;
  const walletShortfall = budget > 0 ? Math.max(0, budget - walletBalance) : 0;
  const checklist = useMemo(
    () => [
      {
        label: "Wallet ready",
        value: budget === 0 ? "Pending" : walletShortfall === 0 ? "Funded" : "Short",
        copy:
          budget === 0
            ? "Set a budget to see how it lines up with your wallet."
            : walletShortfall === 0
              ? "Your wallet covers this gig — escrow locks the moment you post."
              : `You are ${formatMoney(walletShortfall)} short. Top up your account first.`,
      },
      {
        label: "Budget realism",
        value: budget >= 20000 ? "Strong" : budget > 0 ? "Light" : "Pending",
        copy: budget >= 20000 ? "The offer feels credible for quality workers." : "Higher budgets usually improve trust and fill rate.",
      },
      {
        label: "Clarity",
        value: formData.description.length > 80 ? "Strong" : "Needs detail",
        copy: "Clear deliverables reduce disputes and improve matching quality.",
      },
      {
        label: "Scope fit",
        value: formData.required_skills.length > 0 ? "Focused" : "Broad",
        copy: "Selecting key skills helps the matching engine rank workers more accurately.",
      },
    ],
    [budget, walletShortfall, formData.description.length, formData.required_skills.length]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPostError(null);

    try {
      const response = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employer_id: employerId,
          ...formData,
          budget: parseFloat(formData.budget),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/employer/dashboard");
        return;
      }

      setPostError(data.error || "Failed to post gig");
    } catch (error) {
      console.error(error);
      setPostError("Failed to post gig. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((item) => item !== skill)
        : [...prev.required_skills, skill],
    }));
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Employer workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Post a gig</h1>
          </div>
          <Link href="/employer/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_58%,rgba(255,237,213,0.75))]">
            <p className="section-kicker text-orange-600">Create work</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Write the gig like you want the right person to say yes.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Strong marketplaces do not hide job quality behind generic forms. They help employers write cleaner, safer, easier-to-trust briefs.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-[1.75rem] border border-orange-100 bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.06)] sm:p-8"
            >
              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Hiring account</label>
                  <select value={employerId} onChange={(e) => setEmployerId(e.target.value)} className="select-field">
                    {employers.map((employer) => (
                      <option key={employer.id} value={employer.id}>
                        {employer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Gig title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Design a logo for my store"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Description</label>
                  <textarea
                    required
                    placeholder="Describe the work, success criteria, and timeline..."
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="textarea-field"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="select-field"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {titleCase(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Location</label>
                    <input
                      type="text"
                      placeholder="Lagos, NG or Remote"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-800">Budget (NGN)</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-800">Required skills</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {["tailoring", "delivery", "graphic design", "plumbing", "tutoring", "repairs"].map((skill) => (
                      <label
                        key={skill}
                        className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                          formData.required_skills.includes(skill)
                            ? "border-orange-200 bg-orange-50"
                            : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.required_skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="capitalize text-slate-900">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {postError && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-7 text-rose-700">
                  {postError}
                </div>
              )}

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                Posting a gig immediately locks <span className="font-semibold">{budget > 0 ? formatMoney(budget) : "the budget"}</span> from your Gigmark wallet into escrow. You can cancel at any time before the gig is completed to refund yourself.
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button type="submit" disabled={loading || !employerId || walletShortfall > 0} className="btn-primary flex-1 bg-orange-500 px-6 py-3 text-base hover:bg-orange-600">
                  {loading ? "Posting..." : walletShortfall > 0 ? "Wallet too low" : "Post gig and lock escrow"}
                </button>
                <Link href="/employer/dashboard" className="btn-secondary flex-1 px-6 py-3 text-center text-base">
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            {activeEmployer && (
              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">Your Gigmark wallet</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-950">{formatMoney(walletBalance)}</h3>
                {activeEmployer.virtual_account_number && (
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm leading-7 text-slate-700">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Account number</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-slate-950">{activeEmployer.virtual_account_number}</p>
                    <p className="mt-1 text-xs text-slate-500">{activeEmployer.virtual_account_bank}</p>
                  </div>
                )}
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Top up this account from any bank, then post gigs without re-funding each one. Cancellation refunds straight back here.
                </p>
              </div>
            )}

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Brief quality</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950">How strong is this gig already?</h3>
              <div className="mt-6 space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{item.label}</p>
                      <span className="badge-neutral">{item.value}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Live preview</p>
              <h3 className="mt-3 text-xl font-bold text-slate-950">{formData.title || "Your gig title will appear here"}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {formData.description || "A clearer description creates better worker matches and fewer disputes."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="badge-success bg-orange-50 text-orange-700 ring-orange-200">{titleCase(formData.category)}</span>
                <span className="badge-neutral">{formData.location || "Remote"}</span>
                {budget > 0 && <span className="badge-neutral">{formatMoney(budget)}</span>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
