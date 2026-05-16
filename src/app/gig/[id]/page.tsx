"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDate, formatMoney, titleCase } from "@/lib/format";

interface Gig {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  worker_id?: string | null;
  location?: string | null;
  required_skills: string;
  employer_name?: string;
  escrow_locked: number;
  created_at: number;
  completed_at?: number | null;
  proof_of_work?: {
    rating?: number | null;
    feedback?: string | null;
    verified_at?: number | null;
  } | null;
}

interface Worker {
  id: string;
  name: string;
  bio: string;
  skills: string;
  trust_score: number;
  location?: string | null;
  match_score?: number;
  skill_match?: number;
  completion_rate?: number;
  total_gigs_completed?: number;
}

interface VirtualAccountState {
  transaction_ref: string;
  account_name: string;
  account_number: string;
  expected_amount: string;
  expires_at: string;
  bank: string;
  currency: string;
}

export default function GigDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [gig, setGig] = useState<Gig | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignedWorker, setAssignedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [paying, setPaying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paymentState, setPaymentState] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccountState | null>(null);
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");

  const handleCancelGig = async () => {
    if (!gig) return;
    const confirmed = typeof window === "undefined" ? true : window.confirm(`Cancel this gig and refund ${gig.budget.toLocaleString()} NGN to the employer wallet?`);
    if (!confirmed) return;
    setCancelling(true);
    setPaymentError(null);
    try {
      const response = await fetch(`/api/gigs/${gig.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel gig");
      }
      await fetchGig();
    } catch (error) {
      console.error(error);
      setPaymentError(error instanceof Error ? error.message : "Failed to cancel gig");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    setPaymentState(searchParams.get("payment"));
    void fetchGig();
  }, [resolvedParams.id, searchParams]);

  const fetchGig = async () => {
    try {
      const gigResponse = await fetch(`/api/gigs/${resolvedParams.id}`);
      const gigData = await gigResponse.json();
      setGig(gigData);

      if (gigData.worker_id) {
        const workerResponse = await fetch(`/api/users/${gigData.worker_id}`);
        if (workerResponse.ok) {
          const workerData = await workerResponse.json();
          setAssignedWorker(workerData);
        }
      } else {
        setAssignedWorker(null);
      }

      if (gigData.status === "open") {
        const workersResponse = await fetch(`/api/matching?gig_id=${resolvedParams.id}`);
        const workersData = await workersResponse.json();
        setWorkers(workersData);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (workerId: string) => {
    setAssigning(true);
    try {
      const response = await fetch(`/api/gigs/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker_id: workerId }),
      });
      if (response.ok) {
        await fetchGig();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAssigning(false);
    }
  };

  const handleStartPayment = async (channel: "card" | "transfer") => {
    if (!gig?.employer_id) {
      setPaymentError("This gig is missing an employer reference.");
      return;
    }

    setPaying(true);
    setPaymentError(null);
    setPaymentState("starting");

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gig_id: resolvedParams.id,
          employer_id: gig.employer_id,
          channel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start payment");
      }

      setPaymentState("redirecting");
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error(error);
      setPaymentState(null);
      setPaymentError(error instanceof Error ? error.message : "Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCreateVirtualAccount = async () => {
    if (!gig?.employer_id) return;

    setPaying(true);
    setPaymentError(null);

    try {
      const response = await fetch("/api/payment/virtual-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gig_id: gig.id,
          employer_id: gig.employer_id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate transfer account");
      }

      setVirtualAccount(data);
      setPaymentState("virtual-account");
    } catch (error) {
      console.error(error);
      setPaymentError(error instanceof Error ? error.message : "Failed to generate transfer account");
    } finally {
      setPaying(false);
    }
  };

  const handleInstantDemoFunding = async () => {
    if (!gig?.employer_id) return;

    setPaying(true);
    setPaymentError(null);

    try {
      let va = virtualAccount;
      if (!va) {
        const response = await fetch("/api/payment/virtual-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gig_id: gig.id,
            employer_id: gig.employer_id,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate transfer account");
        }
        va = data;
        setVirtualAccount(data);
      }

      if (!va) {
        throw new Error("Failed to prepare transfer account");
      }

      const simulateResponse = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_ref: va.transaction_ref,
          virtual_account_number: va.account_number,
          amount: gig.budget,
        }),
      });

      const simulateData = await simulateResponse.json();
      if (!simulateResponse.ok) {
        throw new Error(simulateData.error || "Simulation failed");
      }

      setPaymentState("success");
      await fetchGig();
    } catch (error) {
      console.error(error);
      setPaymentError(error instanceof Error ? error.message : "Simulation failed");
    } finally {
      setPaying(false);
    }
  };

  const handleCompleteGig = async () => {
    if (!gig?.worker_id) return;

    setCompleting(true);
    try {
      const response = await fetch(`/api/gigs/${gig.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          rating: Number(rating),
          feedback,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete gig");
      }

      await fetchGig();
    } catch (error) {
      console.error(error);
      setPaymentError(error instanceof Error ? error.message : "Failed to complete gig");
    } finally {
      setCompleting(false);
    }
  };

  const paymentNotice = paymentState
    ? {
        success: {
          title: "Escrow funded",
          message: "Payment has been confirmed and the gig budget is now protected.",
        },
        pending: {
          title: "Payment pending",
          message: "Squad has not finalized the transaction yet. Refresh after a moment.",
        },
        failed: {
          title: "Payment failed",
          message: "The payment attempt did not complete successfully.",
        },
        starting: {
          title: "Starting payment",
          message: "Opening the payment rail now.",
        },
        redirecting: {
          title: "Redirecting",
          message: "Hosted checkout is opening in the current tab.",
        },
        "virtual-account": {
          title: "Transfer account ready",
          message: "Use the generated dynamic virtual account to fund escrow by bank transfer.",
        },
      }[paymentState]
    : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="section-shell grid min-h-screen place-items-center">
          <div className="hero-shell max-w-xl text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            <p className="mt-4 text-lg font-semibold">Loading gig workspace...</p>
            <p className="mt-2 text-sm text-slate-600">Bringing in gig details, worker matches, and payment state.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!gig) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="section-shell grid min-h-screen place-items-center">
          <div className="hero-shell max-w-xl text-center">
            <h1 className="text-3xl font-bold">Gig not found</h1>
            <p className="mt-3 text-sm text-slate-600">This gig may have been removed or the link is not correct.</p>
            <Link href="/" className="btn-primary mt-6 bg-orange-500 px-6 py-3 hover:bg-orange-600">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  const requiredSkills = JSON.parse(gig.required_skills || "[]") as string[];
  const funded = gig.escrow_locked > 0;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="section-shell flex items-center justify-between py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Gig workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{gig.title}</h1>
          </div>
          <Link href="/employer/dashboard" className="btn-secondary">Back to dashboard</Link>
        </div>
      </header>

      <section className="section-shell py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <div className="hero-shell border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.95),rgba(255,255,255,1)_60%,rgba(255,237,213,0.7))]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-kicker text-orange-600">Gig detail</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                    {gig.title}
                  </h2>
                  <p className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-500">{titleCase(gig.category)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge-neutral">{titleCase(gig.status)}</span>
                  <span className={`badge ${funded ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                    {funded ? "Escrow funded" : "Awaiting funds"}
                  </span>
                </div>
              </div>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">{gig.description}</p>

              {(paymentNotice || paymentError) && (
                <div className={`mt-6 rounded-[1.5rem] border p-5 ${paymentError ? "border-rose-200 bg-rose-50" : "border-orange-200 bg-orange-50"}`}>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    {paymentError ? "Payment error" : paymentNotice?.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {paymentError || paymentNotice?.message}
                  </p>
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="metric border-orange-100">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Budget</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{formatMoney(gig.budget)}</p>
                </div>
                <div className="metric border-orange-100">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Location</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{gig.location || "Remote"}</p>
                </div>
                <div className="metric border-orange-100">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Escrow</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{funded ? formatMoney(gig.escrow_locked) : "Not funded"}</p>
                </div>
              </div>

              {requiredSkills.length > 0 && (
                <div className="mt-8 rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="section-kicker text-orange-600">Required skills</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {requiredSkills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="badge-success bg-orange-50 text-orange-700 ring-orange-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {virtualAccount && (
                <div className="mt-6 rounded-[1.5rem] border border-orange-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker text-orange-600">Dynamic virtual account</p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-950">{virtualAccount.account_number}</h3>
                      <p className="mt-1 text-sm text-slate-600">{virtualAccount.account_name} · {virtualAccount.bank}</p>
                    </div>
                    <Link
                      href={`/virtual-account?accountNumber=${virtualAccount.account_number}&accountName=${encodeURIComponent(virtualAccount.account_name)}&bank=${encodeURIComponent(virtualAccount.bank)}&amount=${gig.budget}&reference=${virtualAccount.transaction_ref}&expiresAt=${encodeURIComponent(virtualAccount.expires_at)}&gigId=${gig.id}`}
                      className="btn-secondary"
                    >
                      Open transfer page
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expected amount</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{formatMoney(gig.budget)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Reference</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{virtualAccount.transaction_ref}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expires</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{new Date(virtualAccount.expires_at).toLocaleString("en-NG")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Gig summary</p>
              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Posted by</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{gig.employer_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Created</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{formatDate(gig.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Current status</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{titleCase(gig.status)}</p>
                </div>
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Escrow status</p>
              <h3 className="mt-3 text-xl font-bold text-slate-950">
                {funded ? "Funds locked and protected" : "Awaiting wallet funding"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Gigmark moves money from the employer&apos;s wallet into escrow the moment a gig is posted. Funds release to the worker on completion, or refund to the employer if the gig is cancelled.
              </p>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">In escrow</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{funded ? formatMoney(gig.escrow_locked) : "Not funded"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 leading-7 text-slate-700">
                  Cancellation refunds the full amount back to the employer wallet instantly.
                </div>
              </div>

              {gig.status !== "completed" && gig.status !== "cancelled" && (
                <button
                  onClick={() => void handleCancelGig()}
                  disabled={cancelling}
                  className="btn-secondary mt-5 w-full border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel gig and refund"}
                </button>
              )}
            </div>

            <details className="surface border-orange-100 p-6">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Need to top up? Use the Squad payment rail</summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Send money to your employer wallet account via card checkout or a Squad transfer account. This adds to your wallet balance for future gigs.
              </p>
              <div className="mt-4 space-y-3">
                <button onClick={() => void handleStartPayment("card")} disabled={paying} className="btn-primary w-full bg-orange-500 hover:bg-orange-600">
                  {paying ? "Opening checkout..." : "Top up wallet with card"}
                </button>
                <button onClick={() => void handleCreateVirtualAccount()} disabled={paying} className="btn-secondary w-full">
                  {paying ? "Generating account..." : "Generate transfer account"}
                </button>
                {typeof window !== "undefined" && window.location.hostname.includes("localhost") && (
                  <button onClick={() => void handleInstantDemoFunding()} disabled={paying} className="btn-ghost w-full">
                    {paying ? "Funding..." : "Simulate sandbox top-up"}
                  </button>
                )}
              </div>
            </details>

            {assignedWorker && (
              <div className="surface border-orange-100 p-6">
                <p className="section-kicker text-orange-600">Assigned worker</p>
                <h3 className="mt-3 text-xl font-bold text-slate-950">{assignedWorker.name}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{assignedWorker.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {JSON.parse(assignedWorker.skills || "[]").slice(0, 3).map((skill: string, index: number) => (
                    <span key={`${skill}-${index}`} className="badge-success bg-orange-50 text-orange-700 ring-orange-200">
                      {skill}
                    </span>
                  ))}
                </div>
                <Link href={`/worker/${assignedWorker.id}`} className="btn-secondary mt-5 w-full text-center">
                  View worker profile
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {gig.status === "open" && workers.length > 0 && (
        <section className="section-shell pb-12">
          <div className="mb-6">
            <p className="section-kicker text-orange-600">Match results</p>
            <h2 className="section-title mt-2">Recommended workers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {workers.map((worker) => (
              <article key={worker.id} className="surface border-orange-100 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{worker.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{worker.bio}</p>
                  </div>
                  <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right ring-1 ring-orange-200">
                    <p className="text-xs uppercase tracking-[0.28em] text-orange-600">Match</p>
                    <p className="text-3xl font-bold text-slate-950">{worker.match_score}%</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Skills</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">{worker.skill_match}%</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Completion</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">{worker.completion_rate}%</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trust</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">{worker.trust_score}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {JSON.parse(worker.skills || "[]").slice(0, 3).map((skill: string, index: number) => (
                    <span key={`${skill}-${index}`} className="badge-success bg-orange-50 text-orange-700 ring-orange-200">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={`/worker/${worker.id}`} className="btn-secondary flex-1 text-center">View profile</Link>
                  <button onClick={() => void handleAssignWorker(worker.id)} disabled={assigning} className="btn-primary flex-1 bg-orange-500 hover:bg-orange-600">
                    {assigning ? "Assigning..." : "Assign worker"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {gig.status === "assigned" && assignedWorker && (
        <section className="section-shell pb-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Delivery state</p>
              <h2 className="section-title mt-2">This gig is in progress</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Once the work is approved, complete the gig and convert the job into proof-of-work plus payout history.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Worker</p>
                  <p className="mt-2 font-semibold text-slate-950">{assignedWorker.name}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Escrow</p>
                  <p className="mt-2 font-semibold text-slate-950">{funded ? "Protected" : "Not funded yet"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Outcome</p>
                  <p className="mt-2 font-semibold text-slate-950">Rate and release</p>
                </div>
              </div>
            </div>

            <div className="surface border-orange-100 p-6">
              <p className="section-kicker text-orange-600">Complete gig</p>
              <h3 className="mt-3 text-xl font-bold text-slate-950">Turn work into proof and payout</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Rating</label>
                  <select value={rating} onChange={(event) => setRating(event.target.value)} className="select-field">
                    {["5", "4", "3", "2", "1"].map((value) => (
                      <option key={value} value={value}>{value} / 5</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">Feedback</label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    className="textarea-field"
                    placeholder="What went well? What should future employers know?"
                  />
                </div>
                <button onClick={() => void handleCompleteGig()} disabled={completing} className="btn-primary w-full bg-orange-500 hover:bg-orange-600">
                  {completing ? "Completing..." : "Complete gig and release payout"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {gig.status === "cancelled" && (
        <section className="section-shell pb-12">
          <div className="surface border-rose-100 bg-rose-50/40 p-6 sm:p-8">
            <p className="section-kicker text-rose-700">Cancelled</p>
            <h2 className="section-title mt-2">This gig was cancelled.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              The escrow has been refunded to the employer wallet. The gig is no longer visible to workers and cannot be reopened.
            </p>
          </div>
        </section>
      )}

      {gig.status === "completed" && (
        <section className="section-shell pb-12">
          <div className="surface border-orange-100 p-6 sm:p-8">
            <p className="section-kicker text-orange-600">Proof recorded</p>
            <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <h2 className="section-title">This job is now part of the worker&apos;s identity</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The gig has been completed, the proof-of-work record has been created, and payout history can now strengthen the worker&apos;s financial profile.
                </p>
                {gig.proof_of_work?.feedback && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">Employer feedback: {gig.proof_of_work.feedback}</p>
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Completed on</p>
                  <p className="mt-2 font-semibold text-slate-950">{formatDate(gig.completed_at)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Rating</p>
                  <p className="mt-2 font-semibold text-slate-950">{gig.proof_of_work?.rating || "-"}/5</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
