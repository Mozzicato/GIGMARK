import Link from "next/link";

const metrics = [
  { value: "45M+", label: "informal workers Gigmark is designed for" },
  { value: "Proof", label: "every completed gig becomes trusted evidence" },
  { value: "Instant", label: "escrow, payout, and trust signals move together" },
];

const capabilities = [
  {
    title: "Proof-of-work identity",
    description:
      "Each finished job becomes verified history that workers can carry across employers and financial institutions.",
  },
  {
    title: "Squad-powered money movement",
    description:
      "Card payments, transfer flows, dynamic virtual accounts, and verification create a safer hiring loop.",
  },
  {
    title: "AI onboarding",
    description:
      "Workers can join by short chat or voice and still leave with a polished, finance-ready profile.",
  },
  {
    title: "Trust that compounds",
    description:
      "Ratings, completion behavior, and payouts roll into a live reputation layer instead of a static CV.",
  },
  {
    title: "Employer-grade operations",
    description:
      "Hiring teams see who to shortlist, what is funded, and where work is getting stuck.",
  },
  {
    title: "Financial pathways",
    description:
      "The marketplace does not stop at matching. It turns work into savings, credit, and growth readiness.",
  },
];

const productPaths = [
  {
    title: "Worker identity",
    description: "Open a worker profile with proof, trust, payouts, and financial readiness signals.",
    href: "/worker/amara-okafor",
  },
  {
    title: "Employer command center",
    description: "A hiring dashboard with pipeline health, escrow visibility, and top worker signals.",
    href: "/employer/dashboard",
  },
  {
    title: "AI onboarding",
    description: "Text and voice onboarding that builds a complete worker profile in minutes.",
    href: "/onboard",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Gigmark</p>
            <p className="text-sm text-slate-600">Proof-of-work identity for Africa&apos;s informal workforce</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
            <Link href="/onboard" className="btn-primary bg-orange-500 hover:bg-orange-600">
              Start onboarding
            </Link>
          </div>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12 lg:py-16">
        <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_48%,rgba(255,237,213,0.75))]">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <p className="section-kicker text-orange-600">Built for real work, not paperwork</p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-7xl font-extrabold leading-none tracking-tight text-orange-600 sm:text-8xl lg:text-[10rem]">
                Gigmark
              </h1>
              <p className="mt-6 max-w-2xl text-xl font-semibold leading-snug text-slate-950 sm:text-2xl lg:text-3xl">
                Turn completed gigs into trust, payout history, and financial access.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Gigmark helps informal workers build portable economic identity through verified jobs, AI-guided onboarding, and Squad-powered payment rails that make every completed gig count.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboard" className="btn-primary bg-orange-500 px-6 py-3 text-base hover:bg-orange-600">
                  Join as a worker
                </Link>
                <Link href="/employer/onboard" className="btn-secondary px-6 py-3 text-base">
                  Hire with confidence
                </Link>
                <Link href="/login" className="btn-ghost px-6 py-3 text-base">
                  Sign in
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[1.35rem] border border-orange-100 bg-white p-5 shadow-sm">
                    <p className="text-2xl font-bold text-slate-950">{metric.value}</p>
                    <p className="mt-2 text-sm text-slate-600">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="floating-card border-orange-100 bg-[linear-gradient(160deg,#ffffff,#fff7ed)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker text-orange-600">Featured worker</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Amara Okafor</h2>
                    <p className="mt-1 text-sm text-slate-600">Tailoring specialist, Lagos</p>
                  </div>
                  <div className="rounded-2xl bg-orange-500 px-4 py-3 text-right text-white shadow-[0_16px_30px_rgba(249,115,22,0.26)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-100">Trust</p>
                    <p className="text-3xl font-bold">86</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xl font-bold text-slate-950">2+</p>
                    <p className="mt-1 text-xs text-slate-500">Verified gigs</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xl font-bold text-slate-950">4.5</p>
                    <p className="mt-1 text-xs text-slate-500">Average rating</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xl font-bold text-slate-950">NGN 57K</p>
                    <p className="mt-1 text-xs text-slate-500">Verified earnings</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Financial readiness pulse</span>
                    <span>Growth-ready tier</span>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-orange-100">
                    <div className="h-3 w-[78%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="soft-panel border-orange-100">
                  <p className="section-kicker text-orange-600">Worker path</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">Onboard, get hired, build trust.</p>
                  <p className="mt-2 text-sm text-slate-600">The worker never writes a CV from scratch. Their work history does it for them.</p>
                </div>
                <div className="soft-panel border-orange-100">
                  <p className="section-kicker text-orange-600">Employer path</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">Fund safely, hire smarter, release faster.</p>
                  <p className="mt-2 text-sm text-slate-600">Escrow, dynamic virtual accounts, and proof-of-work make the marketplace safer on both sides.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-8 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker text-orange-600">What Gigmark does</p>
            <h2 className="section-title mt-2">A trust and payment layer for informal work.</h2>
          </div>
          <p className="section-copy hidden max-w-xl text-right md:block">
            Every feature is wired around trust, money movement, and worker advancement — not generic marketplace mechanics.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((item) => (
            <article key={item.title} className="feature-card border-orange-100">
              <p className="badge-neutral w-fit bg-orange-50 text-orange-700 ring-orange-200">Core capability</p>
              <h3 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-8 sm:py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {productPaths.map((path) => (
            <Link
              key={path.title}
              href={path.href}
              className="feature-card border-orange-100 bg-[linear-gradient(145deg,rgba(255,255,255,1),rgba(255,247,237,0.9))] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.12)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker text-orange-600">Explore</p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">{path.title}</h3>
                </div>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  Open
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{path.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell py-8 pb-14 sm:py-12">
        <div className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(120deg,rgba(249,115,22,0.08),rgba(255,255,255,1),rgba(251,191,36,0.12))] p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-kicker text-orange-600">The full loop</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                AI onboarding, funded work, proof, payout, and financial unlock.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Gigmark is not just a job board. It is a financial identity engine where every completed gig compounds trust.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/onboard" className="btn-primary bg-orange-500 px-6 py-3 text-base hover:bg-orange-600">
                Start onboarding
              </Link>
              <Link href="/virtual-account" className="btn-secondary px-6 py-3 text-base">
                View transfer flow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
