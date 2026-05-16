import Link from "next/link";
import { formatMoney } from "@/lib/format";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

export default async function VirtualAccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const accountNumber = pickValue(params.accountNumber, "9279755518");
  const accountName = pickValue(params.accountName, "Gigmark Escrow Account");
  const bank = pickValue(params.bank, "GTBank");
  const amount = Number(pickValue(params.amount, "45000"));
  const reference = pickValue(params.reference, "GIZ_escrow_reference");
  const expiresAt = pickValue(params.expiresAt, new Date(Date.now() + 15 * 60 * 1000).toISOString());
  const gigId = pickValue(params.gigId, "");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Payment rail</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Transfer to escrow account</h1>
          </div>
          <Link href={gigId ? `/gig/${gigId}` : "/"} className="btn-secondary">
            {gigId ? "Back to gig" : "Back home"}
          </Link>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_58%,rgba(255,237,213,0.75))]">
              <p className="section-kicker text-orange-600">Dynamic virtual account</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Fund this gig by bank transfer.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Squad can generate a transaction-specific account number for escrow funding. This makes the payment flow feel local-market native without losing verification.
              </p>
            </div>

            <div className="surface border-orange-100 p-6 sm:p-8">
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border-2 border-orange-200 bg-orange-50 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-orange-700">Account number</p>
                  <p className="mt-3 font-mono text-3xl font-bold text-slate-950">{accountNumber}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Use this exact account to fund the gig escrow.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Account name</p>
                    <p className="mt-3 font-semibold text-slate-950">{accountName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Bank</p>
                    <p className="mt-3 font-semibold text-slate-950">{bank}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Amount</p>
                    <p className="mt-3 font-semibold text-slate-950">{formatMoney(amount)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Reference</p>
                    <p className="mt-3 break-all font-mono text-sm font-semibold text-slate-950">{reference}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Next steps</p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    step: "1",
                    title: "Open your bank app",
                    desc: "Log in to your bank or transfer app.",
                  },
                  {
                    step: "2",
                    title: "Send the exact amount",
                    desc: `Transfer ${formatMoney(amount)} into the dynamic account above using the reference ${reference}.`,
                  },
                  {
                    step: "3",
                    title: "Return to Gigmark",
                    desc: "Use the gig page to re-query or simulate payment in sandbox and watch escrow lock immediately.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-50 font-bold text-orange-700">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-950">{item.title}</h4>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
              <h4 className="font-semibold text-emerald-900">Escrow protection stays visible</h4>
              <p className="mt-2 text-sm leading-7 text-emerald-800">
                Once the transfer lands, Gigmark can mark the gig as funded, preserve the payment record, and later turn the completed work into payout history for the worker.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Why this matters</p>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                {[
                  "No card dependency for employers who prefer direct transfer.",
                  "Every transfer can still map back to a single gig reference.",
                  "The dedicated account number itself becomes a receipt the employer can save and forward.",
                  "Keeps the payment experience locally intuitive while preserving verification.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-orange-500">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Transaction expiry</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This account is expected to expire at {new Date(expiresAt).toLocaleString("en-NG")}. If the transfer happens too late, the app should request a fresh account.
              </p>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">How confirmation works</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Once funds hit the account, Squad webhooks (or a transaction re-query from the gig page) confirm the transfer and lock escrow automatically.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
