# Gigmark — One-Page Summary (A4)

> Print target: A4 portrait, 12mm margins, single page. Pandoc command at the bottom of this file converts it.
>
> Layout intent: three vertical bands. Top band = headline + problem + solution. Middle band = two columns (Squad APIs / Four Pillars). Bottom band = product flow + contact strip. Orange accent on headers and the brand block at top-left.

---

<div align="center">

# **GIGMARK**

### Proof-of-work identity for Africa's informal workforce.

*Turn completed gigs into trust. Turn trust into financial access.*

</div>

---

## The problem

**45 million Nigerians** work informally — tailors, riders, technicians, designers, tutors. They have no CVs, no credit history, no portable reputation. Employers cannot verify them. Lenders cannot fund them. The country loses the productive capacity. The workers lose the upside.

## Our solution

**Gigmark turns every completed gig into verified economic identity.** A worker onboards in 60 seconds through a multilingual AI conversation. Every job they finish is funded by escrow, rated by the employer, and paid out to a permanent GTBank account. That record builds a live trust score and financial-readiness profile that unlocks bank products — savings, micro-credit, equipment finance — based on *verified work*, not credit history.

It is not a gig marketplace. It is the **trust and financial-identity layer** that sits underneath one.

---

<table>
<tr>
<td width="50%" valign="top">

### Squad API integration

Squad is the financial rail. Gigmark is the trust layer on top. We use **two different Squad virtual-account types** because permanent identity and one-off escrow funding are two different jobs:

- **Customer VA (permanent)** — every worker and employer gets one lifetime account number. Never expires, accepts any amount. This is Amara's bankable identity — the number she gives to clients, the number she keeps for years.
- **Dynamic VA (per-gig)** — when an employer funds a specific gig, we mint a one-shot account that only accepts the exact escrow amount and expires in 15 minutes. Clean reconciliation against `transaction_ref`. Wrong amounts are refused at the rail, not after.

| Squad endpoint | Purpose in Gigmark |
|---|---|
| Hosted checkout | Card-funded employer wallet top-up |
| Customer Virtual Account | Permanent per-user account number for payouts + ad-hoc top-ups |
| Dynamic Virtual Account | Per-gig escrow funding — exact amount, 15-min expiry, tied to one `transaction_ref` |
| Transaction verification | Post-checkout confirmation against reference |
| Webhook (HMAC-SHA512) | Signed settlement reconciliation, no reliance on browser redirects |

**5 endpoints, two-account strategy, one unified payment loop.** Without Squad, escrow does not exist on this product.

</td>
<td width="50%" valign="top">

### Four-pillar alignment

| Pillar | How Gigmark addresses it |
|---|---|
| **AI Automation** | Zola, multilingual onboarding assistant (EN, Pidgin, YO, HA, IG). Captures 7 structured fields + optional NIN/BVN from free chat. LLM with deterministic fallback. |
| **Use of Data** | Live 6-metric financial score: trust 28%, completion 18%, earnings 18%, rating 14%, activity 12%, liquidity 10%. Updates on every event. |
| **Squad-powered** | Wallet, escrow, payout, verification — all Squad. See left column. |
| **Financial Innovation** | Proof-of-work as an alternative credit signal. Tier-gated bank offers. KYC tiered from phone → NIN/BVN at the lending boundary, not at signup. |

</td>
</tr>
</table>

---

### How it works

1. **Worker chats with Zola** in their language → profile + permanent GTBank account created in ~60s.
2. **Employer posts a gig** → escrow locks against their wallet automatically via Squad.
3. **AI matches workers** by skill overlap (40%) + completion rate (30%) + trust score (30%).
4. **Work completes, rating given** → escrow releases to the worker's permanent account.
5. **Trust + financial scores update live** → tier-specific bank offers surface.

---

<table>
<tr>
<td width="33%" valign="top">

### Impact (Year 1)

- 500 active workers in 90 days
- 5,000 active workers by month 12
- ₦1B gig volume target
- Geographic scale: West Africa, currency-agnostic rails

</td>
<td width="33%" valign="top">

### Revenue model

- 0.5–2% transaction fee per gig
- 15–25% revenue share with partner banks on loans, savings, insurance issued to Gigmark-verified workers
- Premium hiring tools for SME and enterprise hirers

</td>
<td width="34%" valign="top">

### Defence

- Every completed gig deepens the data moat
- Competitors must wait for workers to earn through them first
- Squad rails make payment a feature, not a build

</td>
</tr>
</table>

---

<div align="center">

**Live demo:** `localhost:3000` &nbsp;·&nbsp; **Repo:** github.com/Mozzicato/GIGMARK &nbsp;·&nbsp; **Contact:** Team Mozzicato

*Work becomes proof. Proof becomes identity. Identity unlocks opportunity.*

</div>

---

## Print to PDF

From the project root:

```bash
# Pandoc + a LaTeX engine (xelatex recommended for Unicode/Yorùbá/Hausa/Igbo characters)
pandoc pdf.md -o gigmark-onepager.pdf \
  --pdf-engine=xelatex \
  -V geometry:a4paper,margin=12mm \
  -V mainfont="Inter" \
  -V colorlinks=true \
  -V linkcolor=orange
```

Or, if you don't have Pandoc:

1. Open `pdf.md` in VS Code.
2. Install the **Markdown PDF** extension.
3. Right-click in the file → **Markdown PDF: Export (pdf)**.
4. Set page size A4, margins 12mm, in the extension settings before exporting.

If the content overflows one page after export, the order of things to cut (least to most painful):
1. The "Defence" column header — fold its bullets into the "Revenue model" column.
2. The contact strip at the bottom.
3. The two example bullets from "How it works" steps 4 and 5 — collapse into one line each.
