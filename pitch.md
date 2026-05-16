# Gigmark — Gamma Pitch Deck Prompt

Paste everything between the `=== PROMPT START ===` and `=== PROMPT END ===` lines into Gamma's "Generate" → "Paste in text" flow. Gamma will turn each `---` separated block into a slide. Edit visuals after generation.

**Brand cues for Gamma's style chooser:** orange-led palette (#F97316 primary, #FB923C accent), warm off-white background (#FFF7ED), slate-900 text, generous whitespace, single hero number per slide where possible, sans-serif modern (Inter / Geist family). Tone: confident, specific, no jargon dressing.

---

=== PROMPT START ===

Title: **Gigmark — Turn work into identity. Turn identity into opportunity.**

Generate an 8-slide investor / hackathon pitch deck. Follow the exact structure below. Each `---` is a new slide. Do not invent claims I have not given you. Keep copy tight: headline + 3–5 short bullets max per slide. Pull a single emphasis number out of the body and make it the visual anchor on slides that have one. Brand: orange (#F97316), warm cream background, dark slate text, modern sans-serif.

---

**Slide 1 — Title**

Headline: Gigmark
Subhead: Proof-of-work identity for Africa's informal workforce.
Tagline: Turn completed gigs into trust. Turn trust into financial access.
Footer: Built on Squad. Hackathon submission, 2026.
Visual: full-bleed wordmark, single orange brand block, no clutter.

---

**Slide 2 — Problem**

Headline: 45 million workers. Zero economic identity.
Body:
- Nigeria's informal workforce — tailors, riders, technicians, tutors, designers — has no CVs, no credit history, no portable reputation.
- Employers can't tell who is safe to hire.
- Lenders can't tell who is safe to fund.
- Result: skilled, active people stay economically invisible. The country loses the productive capacity. They lose the upside.
- This is *now* — fintech rails matured, regulators want financial inclusion, but the identity layer underneath them is missing.

Emphasis number: **45M+**

---

**Slide 3 — Target User**

Headline: We built this for Amara.
Body:
- Amara, 28, tailor in Lekki. Earns ₦80k–₦150k/month from boutique orders and walk-ins. Owns a sewing machine on hire-purchase. Has a phone-based account, no bank credit, no formal income record.
- Behind Amara: ~17M Nigerian tailors, riders, artisans, and small-trade workers in the same situation. Plus Tunde the rider, Chiamaka the designer, Yusuf the plumber, Ngozi the tutor.
- What they actually want: a way to *prove* the work they already do, so they can borrow for tools, smooth income gaps, and get hired again without starting from zero.
- What they don't want: another KYC form before they've earned a single naira.
- Research method (next 30 days): structured interviews with 15 Lagos and Abuja workers across tailoring, dispatch, and design — recruited via the boutique cluster on Awolowo Road and the dispatch hubs in Yaba.

Visual: a stylised worker portrait card with name, age, trade, location, monthly earnings range, current credit access (none).

---

**Slide 4 — Solution**

Headline: Work becomes proof. Proof becomes identity. Identity unlocks money.
Body:
- A worker onboards in 60 seconds through a conversation with an AI assistant (Zola) — in English, Pidgin, Yorùbá, Hausa, or Igbo.
- Every completed gig is verified, rated, and paid through escrow. That record becomes a living CV — and a financial profile that updates in real time.
- Employers see a trust-aware marketplace. Lenders see a pipeline of behaviourally-scored borrowers. Workers see savings, credit, and equipment finance products unlock as they earn.
- It's not a gig marketplace. It's the **identity and financial infrastructure** that sits under one.

Visual: three-step horizontal flow — Work → Identity → Financial Access — with the same orange thread connecting them.

---

**Slide 5 — Squad API Integration**

Headline: Two virtual-account types. Two different jobs. Both wired.
Body:
- **Why two?** Permanent identity and one-off escrow funding are different products. We use Squad's **Customer VA** for the first and Squad's **Dynamic VA** for the second.
- **Customer Virtual Account (permanent)** — every worker and employer gets one lifetime account number. Never expires, accepts any amount. This is Amara's bankable identity, the number she gives to clients for years.
- **Dynamic Virtual Account (per-gig)** — when an employer funds a specific gig, Squad mints a one-shot account that only accepts the exact escrow amount and auto-expires in 15 minutes. Clean reconciliation against a single `transaction_ref`; wrong amounts are refused at the rail.
- **Hosted checkout** for card top-ups, **transaction verification** for redirect confirmation, **HMAC-SHA512 webhook** for signed settlement so we never trust a browser callback alone.

Visual: a split panel — left side a "Customer VA" card with a never-expires badge, right side a "Dynamic VA" card with a countdown timer and "exact ₦25,000" lock.

Emphasis: **5 Squad endpoints · 2 VA strategies · 1 escrow loop**

---

**Slide 6 — AI / Data Intelligence**

Headline: Two of the four pillars, working together.
Body:
- **AI Automation** — Zola, the multilingual onboarding assistant, captures 7 structured fields from a free-flow chat in any of 5 languages, including optional NIN/BVN for KYC tier-up. No forms. Falls back from LLM to deterministic parsing so the flow never breaks.
- **Use of Data** — a live financial-readiness score with 6 weighted metrics: trust 28%, completion 18%, earnings 18%, rating 14%, activity 12%, liquidity 10%. Updates on every gig event. Drives tier-gated product offers.
- **Matching engine** — workers ranked for each gig on skill overlap (40%) + completion rate (30%) + trust score (30%).
- Every weight is human-readable, explainable, and auditable. No black-box scoring.

Visual: a clean stacked-bar split of the six metric weights with their colours.

---

**Slide 7 — User Flow**

Headline: Sixty seconds in. Six months later, bankable.
Body (numbered, six steps):
1. Worker chats with Zola in their language. KYC tier captured. Profile created with a permanent GTBank payout account.
2. Employer posts a gig. Escrow locks against their wallet automatically — Squad rail under the hood.
3. AI matches top workers by skills + trust + completion history.
4. Worker is assigned, completes the job, gets rated.
5. Escrow releases to the worker's permanent account. Trust score and financial profile recompute live.
6. Tier-specific bank offers surface — equipment finance, working capital, savings — based on verified earning history, not credit score.

Visual: six numbered orange chips on a horizontal rail; below each, a faded screenshot from the live product (onboarding, dashboard, gig page, worker profile, financial twin, offers panel).

---

**Slide 8 — Impact & Business Model**

Headline: A trust layer for 45M workers, with three revenue streams.
Body:
- **Year 1 reach**: 500 active workers in Lagos and Abuja by month 3; 5,000 by month 12. ₦50M gig volume in the first 90 days, ₦1B by month 12, on conservative assumptions of 8 gigs/worker/quarter at ~₦25k average ticket.
- **Geographic scale**: rails generalise across West Africa. No technical blocker on Ghana, Kenya, Uganda — currency-aware, bank-pluggable. Mobile money infrastructure already mature in those markets.
- **Revenue**:
  1. **Transaction fee** — 0.5–2% per gig processed through escrow.
  2. **Partner revenue share** — 15–25% on loans, savings products, and insurance issued to Gigmark-verified workers.
  3. **Premium hiring tools** — analytics and bulk verification for SME and enterprise hirers.
- **Why this defends**: every gig deepens the data moat. The competitor catching up has to wait for workers to earn through them first.

Emphasis number: **₦1B gig volume — Year 1 target**

---

**Closing slide (optional, slide 9)**

Headline: Work is already happening. We just made it count.
Subhead: gigmark.app · github.com/Mozzicato/GIGMARK
Footer: Team Gigmark — Mozzicato, 2026.

=== PROMPT END ===

---

## How to use this

1. Open Gamma, click **Generate** → **Paste in text**.
2. Paste everything between the `===` markers above.
3. In Gamma's settings: pick **8-card** length, **modern minimalist** template, **deep orange** accent. Aspect 16:9.
4. Generate. Review each slide. Push back on any auto-generated copy that softens the specifics — Gamma sometimes paraphrases away the numbers.
5. Drop in screenshots from the live product on slide 7. Use `/onboard`, `/employer/dashboard`, `/worker/amara-okafor`, and the gig-detail page.
6. Export to PDF for backup before the pitch.

## What this deck deliberately does *not* claim

- We do not say we have already interviewed 15 workers. Slide 3 names the research plan, not a completed program. If a judge asks "have you spoken to users yet?", the honest answer is: *"Three informal conversations, structured interviews scheduled this week."* — adjust to whatever is true on pitch day.
- We do not put a fake testimonial quote on screen.
- We do not put a unit economics chart that we cannot defend at 1-on-1 follow-up.

## If you have 10 minutes before the pitch

Update slide 3 with the names of any real workers you have actually talked to. Even one real first-hand quote (with permission) replaces every line of this slide with something stronger than what's drafted here.
