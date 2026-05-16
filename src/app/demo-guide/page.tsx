import Link from "next/link";

const STEPS = [
  {
    time: "Step 1",
    title: "Problem and positioning",
    action: "Start on the homepage to see what Gigmark is in one screen.",
    details: "Gigmark is trust infrastructure for informal workers — not just another gig marketplace.",
    href: "/",
  },
  {
    time: "Step 2",
    title: "Worker identity",
    action: "Open Amara's profile to see trust, earnings, proof-of-work, and financial readiness.",
    details: "Completed work becomes a financial signal a bank or lender can read.",
    href: "/worker/amara-okafor",
  },
  {
    time: "Step 3",
    title: "AI onboarding",
    action: "Walk through the onboarding flow and watch a live profile take shape.",
    details: "Workers join through short text or voice prompts — no CV required.",
    href: "/onboard",
  },
  {
    time: "Step 4",
    title: "Funding and escrow",
    action: "Open a gig and fund escrow by card or generate a transfer account.",
    details: "Squad powers hosted checkout, transfer accounts, escrow state, and verification.",
    href: "/employer/dashboard",
  },
  {
    time: "Step 5",
    title: "Close the loop",
    action: "Complete the gig and return to the worker profile.",
    details: "End on the full arc: onboard, work, get paid, build identity, unlock financial access.",
    href: "/worker/amara-okafor",
  },
];

export default function ProductTour() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Product tour</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Walk through Gigmark</h1>
          </div>
          <Link href="/" className="btn-secondary">
            Back home
          </Link>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_58%,rgba(255,237,213,0.75))]">
              <p className="section-kicker text-orange-600">Five steps</p>
              <h2 className="mt-3 text-4xl font-bold text-slate-950">The full Gigmark flow, end to end</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Informal work becomes verified identity. Verified identity becomes bankable.
              </p>

              <div className="mt-8 space-y-6 border-l-2 border-orange-200 pl-6">
                {STEPS.map((step) => (
                  <div key={step.time} className="py-2">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-orange-500">{step.time}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{step.action}</p>
                        <Link href={step.href} className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700">
                          Open step
                        </Link>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{step.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Why Gigmark exists</p>
              <div className="mt-4 space-y-3">
                {[
                  "Gigmark is a portable trust and financial identity layer, not just a marketplace.",
                  "Workers do not need polished CVs to become credible — their completed jobs are the proof.",
                  "Squad powers the money movement that makes the trust layer believable: checkout, transfer accounts, verification, and escrow.",
                  "The employer dashboard shows real operational decisions instead of just a list of gigs.",
                  "The worker profile turns marketplace behavior into lender-readable signals.",
                ].map((point) => (
                  <div key={point} className="rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Quick links</p>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  { label: "Homepage", href: "/" },
                  { label: "Worker profile", href: "/worker/amara-okafor" },
                  { label: "AI onboarding", href: "/onboard" },
                  { label: "Employer dashboard", href: "/employer/dashboard" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200">
                    <p className="font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.href}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">If something stalls</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {[
                  "Hosted checkout slow? Use the simulate sandbox funding action on the gig page.",
                  "Voice input acting up? Switch to text — the flow continues the same way.",
                  "Anything else? Open the worker profile and walk through trust and financial readiness.",
                ].map((move) => (
                  <div key={move} className="flex items-start gap-2">
                    <span className="text-orange-500">+</span>
                    <span>{move}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Talking points</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {[
                  "Lead with the problem and close with financial access.",
                  "Squad is the bridge between marketplace trust and real money movement.",
                  "Every completed gig compounds the worker's economic identity.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
