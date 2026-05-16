# Gigmark — Gamma Pitch Deck Prompt (10 slides)

Paste everything between the `=== PROMPT START ===` and `=== PROMPT END ===` lines into Gamma's "Generate" → "Paste in text" flow. Gamma will turn each `---` separated block into a slide. Edit visuals after generation.

**Brand cues for Gamma's style chooser:** orange-led palette (#F97316 primary, #FB923C accent), warm off-white background (#FFF7ED), slate-900 text, generous whitespace, single hero number per slide where possible, sans-serif modern (Inter / Geist family). Tone: confident, specific, no jargon dressing.

**Slide count:** the rubric allows max 10 content slides. This prompt produces exactly 10 in the rubric's order. Gamma's auto-generated cover (deck title) is separate and doesn't count against the 10.

---

=== PROMPT START ===

Deck title: **Gigmark — Turn work into identity. Turn identity into opportunity.**

Generate exactly 10 slides in the order below. Each `---` is a new slide. Do not invent claims I have not given you. Keep copy tight: headline + 3–5 short bullets max per slide. Pull a single emphasis number out of the body and make it the visual anchor on slides that have one. Brand: orange (#F97316), warm cream background, dark slate text, modern sans-serif. Do not add a separate title slide — start directly with slide 1 (Problem).

---

**Slide 1 — Problem**

Headline: 45 million workers. Zero economic identity.
Body:
- Nigeria's informal workforce — tailors, riders, technicians, tutors, designers — has no CVs, no credit history, no portable reputation.
- Employers can't tell who is safe to hire.
- Lenders can't tell who is safe to fund.
- Result: skilled, active people stay economically invisible. The country loses the productive capacity. They lose the upside.
- This is *now* — fintech rails matured, regulators want financial inclusion, but the identity layer underneath them is missing.

Emphasis number: **45M+**

---

**Slide 2 — Target User**

Headline: We built this for Amara.
Body:
- Amara, 28, tailor in Lekki. Earns ₦80k–₦150k/month from boutique orders and walk-ins. Owns a sewing machine on hire-purchase. Has a phone-based account, no bank credit, no formal income record.
- Behind Amara: ~17M Nigerian tailors, riders, artisans, and small-trade workers in the same situation. Plus Tunde the rider, Chiamaka the designer, Yusuf the plumber, Ngozi the tutor.
- What they actually want: a way to *prove* the work they already do, so they can borrow for tools, smooth income gaps, and get hired again without starting from zero.
- What they don't want: another KYC form before they've earned a single naira.
- Research method (in progress): structured interviews with 15 Lagos and Abuja workers across tailoring, dispatch, and design — recruited via the boutique cluster on Awolowo Road and the dispatch hubs in Yaba.

Visual: a stylised worker portrait card with name, age, trade, location, monthly earnings range, current credit access (none).

---

**Slide 3 — Solution Overview**

Headline: Work becomes proof. Proof becomes identity. Identity unlocks money.
Body:
- A worker onboards in 60 seconds through a conversation with an AI assistant (Zola) — in English, Pidgin, Yorùbá, Hausa, or Igbo.
- Every completed gig is verified, rated, and paid through escrow. That record becomes a living CV — and a financial profile that updates in real time.
- Employers see a trust-aware marketplace. Lenders see a pipeline of behaviourally-scored borrowers. Workers see savings, credit, and equipment finance products unlock as they earn.
- It's not a gig marketplace. It's the **identity and financial infrastructure** that sits under one.

Visual: three-step horizontal flow — Work → Identity → Financial Access — with the same orange thread connecting them.

---

**Slide 4 — Squad API Integration**

Headline: Two virtual-account types. Two different jobs. Both wired.
Body:
- **Why two?** Permanent identity and one-off escrow funding are different products. We use Squad's **Customer VA** for the first and Squad's **Dynamic VA** for the second.
- **Customer Virtual Account (permanent)** — every worker and employer gets one lifetime account number. Never expires, accepts any amount. This is Amara's bankable identity, the number she gives to clients for years.
- **Dynamic Virtual Account (per-gig)** — when an employer funds a specific gig, Squad mints a one-shot account that only accepts the exact escrow amount and auto-expires in 15 minutes. Clean reconciliation against a single `transaction_ref`; wrong amounts are refused at the rail.
- **Hosted checkout** for card top-ups, **transaction verification** for redirect confirmation, **HMAC-SHA512 webhook** for signed settlement so we never trust a browser callback alone.

Visual: a split panel — left side a "Customer VA" card with a never-expires badge, right side a "Dynamic VA" card with a countdown timer and "exact ₦25,000" lock.

Emphasis: **5 Squad endpoints · 2 VA strategies · 1 escrow loop**

---

**Slide 5 — AI / Data Intelligence**

Headline: Two of the four pillars, working together.
Body:
- **AI Automation** — Zola, the multilingual onboarding assistant, captures 7 structured fields from a free-flow chat in any of 5 languages, including optional NIN/BVN for KYC tier-up. No forms. Falls back from LLM to deterministic parsing so the flow never breaks.
- **Use of Data** — a live financial-readiness score with 6 weighted metrics: trust 28%, completion 18%, earnings 18%, rating 14%, activity 12%, liquidity 10%. Updates on every gig event. Drives tier-gated product offers.
- **Matching engine** — workers ranked for each gig on skill overlap (40%) + completion rate (30%) + trust score (30%).
- Every weight is human-readable, explainable, and auditable. No black-box scoring.

Visual: a clean stacked-bar split of the six metric weights with their colours.

---

**Slide 6 — User Flow**

Headline: Sixty seconds in. Six months later, bankable.
Body (numbered, six steps):
1. Worker chats with Zola in their language. KYC tier captured. Profile created with a permanent Customer VA payout account.
2. Employer posts a gig. Escrow locks against their wallet automatically — Squad rail under the hood.
3. AI matches top workers by skills + trust + completion history.
4. Worker is assigned, completes the job, gets rated.
5. Escrow releases to the worker's permanent account. Trust score and financial profile recompute live.
6. Tier-specific bank offers surface — equipment finance, working capital, savings — based on verified earning history, not credit score.

Visual: six numbered orange chips on a horizontal rail; below each, a faded screenshot from the live product (onboarding, dashboard, gig page, worker profile, financial twin, offers panel).

---

**Slide 7 — Impact Potential**

Headline: Who this reaches, how fast.
Body:
- **Year 1 reach**: 500 active workers in Lagos and Abuja by month 3; 5,000 active workers across Nigeria by month 12.
- **Ground game**: starts in Lekki (tailoring), Yaba (dispatch), Wuse 2 (services). Concentration first, then expansion. Each cluster anchors 50–100 workers.
- **Workers reached this affects**: ₦1B+ gig volume processed in Year 1 means real bank-verifiable income records for every active worker — a population that is currently invisible to credit and savings products.
- **Why now**: mobile money penetration crossed 60M wallets, regulators want digital inclusion, and informal-worker income is at an all-time high but still unbanked. The rails are ready. The identity layer is the missing piece.
- **Stretch (Year 2)**: West Africa — Ghana, Kenya, Uganda — currency-aware, bank-pluggable. No technical blocker.

Emphasis number: **5,000 workers · ₦1B gig volume — Year 1 target**

---

**Slide 8 — Scalability & Business Model**

Headline: Three revenue streams. One compounding data moat.
Body:
- **Transaction fee** — 0.5–2% per gig processed through escrow. Pays for itself once gig volume crosses ~₦300M/month.
- **Partner revenue share** — 15–25% on loans, savings, and insurance issued to Gigmark-verified workers. This is the long-tail revenue line, not the wedge.
- **Premium hiring tools** — bulk verification and analytics for SME and enterprise hirers. Pricing in the ₦200k–₦2M/year band.
- **Why this defends**: every completed gig deepens the dataset competitors don't have. Catching up means waiting for workers to earn through your platform first.
- **Unit economics**: at ₦25k average gig × 8 gigs/worker/quarter × 1% fee = ₦2,000 revenue per worker per quarter, before partner revenue share. CAC target: under ₦1,500 per worker via cluster-based referral.

Emphasis number: **3 revenue streams · 1 data moat**

---

**Slide 9 — Research & Validation**

Headline: What's already true. What we're still proving.
Body:
- **Market evidence (already true)**: Nigeria's informal economy is ~57% of GDP and ~92% of the workforce (NBS, 2024). Mobile money active wallets crossed 60M in 2024. The rail is ready. The behavioural data is happening. The identity layer is the gap.
- **Technical validation (already true)**: the full Squad escrow loop runs end-to-end on sandbox today — hosted checkout, DVA reconciliation, HMAC-signed webhook, payout to a permanent account. Not a mock; a live integration on `github.com/Mozzicato/GIGMARK`.
- **User-side validation (in progress)**: [N informal conversations with tailors/riders/tutors so far — fill in the real number before the pitch]. Structured interviews with 15 workers scheduled across tailoring, dispatch, and design via the boutique cluster on Awolowo Road and the Yaba dispatch hubs.
- **What would falsify this**: workers refusing to share gig data in exchange for financial-product access. Our early conversations show the opposite — everyone we have spoken to wants a way to prove the work they already do.
- **What we are *not* claiming**: signed lender pilots, paying customers, or revenue. We have built the product; the market work begins now.

Emphasis (use a small honesty-tag, not a hero number): **Built end-to-end · Interviewing this week**

---

**Slide 10 — The Team**

Headline: Four builders. One product. Shipped before pitched.
Body:
- **Salaudeen Mubarak** — Team lead, full-stack. Built the Squad escrow loop end-to-end, the multilingual onboarding flow across five languages (English, Pidgin, Yorùbá, Hausa, Igbo), and the live financial-readiness scoring engine.
- **Ayinde Wisdom Elisha** — Frontend developer. [One specific contribution — e.g. "Shipped the worker profile, financial twin layout, and the gig-detail payment UI." Edit to match what's true.]
- **Okoro Farid** — UI/UX designer. [One specific contribution — e.g. "Defined the orange-led visual language and the chat-led onboarding pattern that makes the product feel like a conversation, not a form." Edit to match what's true.]
- **Aliyu Abdul-Muqodeem** — Frontend developer. [One specific contribution — e.g. "Shipped the employer dashboard, the post-gig flow, and the celebration view that closes the onboarding loop." Edit to match what's true.]
- **Why us**: Four UNILAG students. The informal economy isn't a market we studied — it's the neighbourhood we live in. Gigmark is the receipt that work was always supposed to print.

Visual: a 2x2 grid of portrait cards — name, role, one credibility line each. Orange accents, consistent silhouettes if photos aren't available, equal card size.

=== PROMPT END ===

---

## Fill these in before generating the deck

The prompt contains intentional placeholders so you don't ship anything you can't defend:

1. **Slide 2 (Target User)** — *"Research method (in progress)"*. If you've already had real conversations, change "in progress" to "completed with N workers". Otherwise leave it; "in progress" is honest.
2. **Slide 9 (Research & Validation)** — replace `[N informal conversations]` with the real count. Zero is fine if zero; the structured-interview plan still validates the slide. If the number is zero, change the bullet to: *"User-side validation begins this week — structured interviews with 15 workers scheduled..."*
3. **Slide 10 (The Team)** — names and roles are filled in. Three of the four credibility lines have a starter sentence in brackets — replace each `[...]` with what's actually true for that person. Two minutes. The "Why us" line is written assuming you're all UNILAG students; if any of you are from elsewhere, edit it.

## How to use this

1. Open Gamma, click **Generate** → **Paste in text**.
2. Paste everything between the `===` markers above.
3. In Gamma's settings: pick **10-card** length, **modern minimalist** template, **deep orange** accent. Aspect 16:9.
4. Generate. Review each slide. Push back on any auto-generated copy that softens the specifics — Gamma sometimes paraphrases away the numbers.
5. Drop in screenshots from the live product on slide 6. Use `/onboard`, `/employer/dashboard`, `/worker/amara-okafor`, and the gig-detail page.
6. Export to PDF for backup before the pitch.

## What this deck deliberately does *not* claim

- No fake user testimonial quotes.
- No signed lender pilots or paying customers.
- No team members or advisors who haven't agreed to be named on the deck.
- No unit economics chart we cannot defend in 1-on-1 follow-up.

## If you have 10 minutes before the pitch

1. Fill in the slide 10 team placeholders.
2. Talk to **one** real tailor or rider on WhatsApp. Get permission to quote one sentence. Drop it onto slide 2 as a real quote — single biggest credibility upgrade available in 10 minutes.
3. Update slide 9 with the real conversation count.
