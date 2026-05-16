"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployerOnboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    location: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.name) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "employer",
          language: "en",
        }),
      });

      if (response.ok) {
        router.push("/employer/dashboard");
      } else {
        alert("Failed to create account");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <Link href="/" className="btn-ghost px-0 py-0 text-sm text-slate-600">
            Back home
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Employer onboarding</p>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-start">
          <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_58%,rgba(255,237,213,0.75))]">
            <p className="section-kicker text-orange-600">Hire with trust</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Bring verified workers into a cleaner hiring flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Set up your hiring account in under a minute. Once you&apos;re in, you can post gigs, fund escrow, and shortlist verified workers right away.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[1.75rem] border border-orange-100 bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.06)] sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Business name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your business name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Phone number <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Lagos, NG"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">About your business</label>
                <textarea
                  placeholder="Tell us what you do and what kinds of gigs you usually post..."
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="textarea-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full bg-orange-500 px-6 py-3 text-base hover:bg-orange-600">
                {loading ? "Creating account..." : "Create employer account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Looking to work with us instead?{" "}
              <Link href="/onboard" className="font-semibold text-orange-600 hover:text-orange-700">
                Join as a worker
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Why Gigmark</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">A safer way to hire.</h2>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  "Access verified workers with visible trust scores",
                  "Use AI matching to shortlist stronger candidates faster",
                  "Keep escrow, transfer, and payout signals visible in one workflow",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">+</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">What you get</p>
              <h3 className="mt-3 text-xl font-bold text-slate-950">A clean hiring workspace from day one.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Funded escrow, ranked worker matches, and full payment visibility in one dashboard — nothing to configure.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
