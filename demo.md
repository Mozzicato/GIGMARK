# Gigmark — 5-minute stage script

5 minutes total: ~30s framing, ~4 min live demo, ~30s close.
Browser at `http://localhost:3000`. Have two tabs ready:
- Tab 1: `/onboard` (the worker entry)
- Tab 2: `/login` (the employer entry)

The narrative spine: **a worker enters → financial offers appear from her answers → completed gigs upgrade those offers over time → employers fund safely from a permanent wallet.** Onboarding and post-completion both feed the same identity engine.

---

## 0:00 – 0:30 · Frame the problem
**Spoken (slide if you have one):**
> "Nigeria has 45 million informal workers — tailors, riders, technicians. No CVs. No credit history. No portable trust. Employers can't tell who is safe to hire. Lenders can't tell who is safe to fund. Gigmark fixes both — and the same data that builds trust also builds financial access."

Cut to browser. Scroll once so the giant **Gigmark** wordmark lands. One second.

---

## 0:30 – 1:30 · A worker enters Gigmark (live conversational onboarding)
**Tab 1 → `/onboard`**

**Say:**
> "A worker joins. No CV, no resume. Just a chat with Zola — text or voice — exactly like talking to a person."

The bot is already waiting with: *"Hi! I'm Zola, the Gigmark onboarding assistant. What should I call you?"*

Type / click in sequence (Zola acknowledges every answer — no waiting for AI calls). Narrate over Zola's lines rather than reading them verbatim; the exact bot wording is listed for sanity-check only.

| # | What you do | What Zola says back |
|---|---|---|
| 1 | Type `Amina Yusuf` → **Send** | *"Lovely to meet you, Amina."* then asks for the phone number |
| 2 | Type `+2348010000123` → **Send** | *"Saved — I'll use +2348010000123 as your contact number."* then asks for location |
| 3 | Type `Lagos` → **Send** | *"Lagos — great, plenty of work in that area."* then asks for work |
| 4 | Click the **Tailoring** chip | *"Noted — I've got tailoring."* then the **partner mention**: *"Quick heads-up — once you complete a few tailoring gigs on Gigmark, our GTBank partnership opens up an equipment-finance line for sewing machines and tools, up to ₦200,000. Worth knowing."* |
| 5 | Click the **Borrow for tools** chip | The goal-mention: *"Noted. Borrowing-for-tools is one of the strongest paths on Gigmark — three verified gigs plus a clean rating opens an equipment finance application with GTBank."* |
| 6 | Click the **Bank transfer** chip | *"Got it — Bank transfer."* then asks for NIN or BVN |
| 7 | Type a fake 11-digit number `12345678901` (or click **Skip for now**) | If you typed a number: *"Saved. Your KYC tier will step up automatically once we verify with NIMC/NIBSS."* If you skipped: *"No problem — we'll prompt again before the first lending product."* Then a clean summary of all seven fields |

**Say (as the summary lands):**
> "Notice what just happened — without a single form, Zola knows her name, phone, location, work, financial goal, payout rail, and her KYC tier. She skipped NIN for now, which is fine — phone-verified is enough to start earning. We'll step her up before the first credit product."

**Click the big green button: "Yes, create my Gigmark account."**

The page swaps to a celebration view:
> 🎉 Congratulations, **Amina**!
> Your permanent virtual account: **9XXXXXXXXX** (GTBank · Amina Yusuf (Gigmark Payout))

**Say (pointing at the account card):**
> "That's her permanent Gigmark account. Every gig she completes pays out here. Her financial identity just got created — in 60 seconds, in a conversation."

---

## 1:30 – 2:30 · Where this leads — a mature worker (Amara)
On the celebration screen, **click "View my profile"** — or paste `/worker/amara-okafor` if you want to skip Amina and show a more developed worker.

**Say while scrolling slowly:**
> "This is Amara — Amina, six months later. Same onboarding flow, but now with verified work behind her. Trust score 86. Verified earnings. A permanent payout account on GTBank: `9257836913`."

Scroll to **Financial readiness** and **Specialized offers**.

**Say, pointing at the offers:**
> "And those offers from onboarding? They've upgraded. Every completed gig moves her up a tier — savings, credit, working capital. Onboarding plants the seed. Completed work compounds it."

Scroll to the **proof-of-work timeline**.

**Say:**
> "Every gig she's finished sits here — escrow funded, escrow released, rated, with employer feedback. This is her living CV. It updates itself."

**Click:** **Download CV** in the page header. The print dialog auto-opens.

**Say:**
> "One click, verified PDF. She can take this to a landlord, a bank, a microfinance app. Work becomes a document the formal economy can read."

(Cancel or save the print — your call. Practice this beat.)

---

## 2:30 – 3:45 · The employer side — money moves live
**Tab 2 → `/login`**

The toggle is already on **I'm hiring**. **Click the Bella Boutique tile.**

**Say:**
> "Now the employer. Every employer has one permanent Gigmark account — escrow comes straight from this wallet. Bella has ₦180,000 sitting in hers."

You land on `/employer/dashboard`. Pause on the **Wallet** and **Active escrow** metrics for a beat.

**Click:** **Post a gig** (top right).

Fill in **fast**:
- Title: `Stitch 10 staff aprons`
- Description: `Branded aprons for the boutique relaunch.`
- Category: `tailoring`
- Budget: `25000`
- Required skills: tick **Tailoring** (so Amara ranks top on assignment)

Watch the **Wallet ready** chip flip to **Funded**.

**Click:** **Post gig and lock escrow.**

**Say (as the dashboard re-renders):**
> "₦25,000 just moved from Bella's wallet into escrow. No checkout. No waiting. Squad rails under the hood. The gig is live, funded, and a worker can be assigned right now."

(Bella's wallet drops to ₦155,000 in the **Employer accounts** panel; the new gig shows up with escrow already locked.)

**Click:** the new gig from the action queue → top-ranked worker → **Assign worker**.

Then complete:
- Rating: `5`
- Feedback: `Fast turnaround, excellent finishing.`
- **Click:** **Complete gig and release payout.**

**Say:**
> "Escrow just released to the worker's payout account. Bella's books are clean. And on the worker's side — that gig is now a new entry on her living CV, and a new signal in her financial profile."

---

## 3:45 – 4:15 · The safety beat (cut if behind schedule)
Open any open gig from the dashboard.

**Say:**
> "And because escrow is wallet-based, the employer is never trapped. One click cancels a gig and refunds the full amount instantly."

**Click:** **Cancel gig and refund.** Confirm. Wallet jumps back up on the dashboard.

---

## 4:15 – 5:00 · Close
**Spoken (slide if you have one):**
> "Gigmark is one identity layer and one payment layer for informal work. Onboarding starts the financial story. Every completed gig strengthens it. Squad powers the rails — Gigmark powers the trust. 45 million workers, one Gigmark account at a time."

---

## Likely judge questions — short answers

**Q: How do you know these workers are real? What about fraud?**
A: Gigmark uses a **tiered verification model**. At signup we capture phone + behavioral signals (completed gigs, employer ratings, payment consistency, dispute rate). That's enough to build trust on the marketplace side. When a worker crosses into financial products — micro-credit, equipment finance, working capital — we step up to formal KYC: **NIN, BVN, and biometric match** through standard providers (Smile Identity, Dojah, Verified.ng). The trust score gates what they can access; the formal KYC gates whether a lender can disburse. We never need to over-collect KYC just to let someone earn from a gig.

**Q: Why not require NIN/BVN at signup?**
A: Two reasons. One, the informal-worker population is already friction-sensitive — every extra form is a drop-off. Two, NIN/BVN at signup proves identity but not *bankability*. The proof-of-work signal does both. So we let the worker earn first, and step up KYC at the moment it actually unlocks money.

**Q: How does the worker onboard if they don't speak English?**
A: The onboarding has a language toggle at the top — **English, Pidgin, Yorùbá, Hausa, Igbo**. The whole Zola conversation switches, including the summary card. The chip suggestions (Tailoring, Bank transfer, etc.) stay in English on purpose — they're the canonical category labels the marketplace runs on. Voice mode uses the matching speech locale where the browser supports it.

**Q: What stops someone from creating fake gig history?**
A: Gigs are funded by the **employer's wallet** before any worker sees them — escrow is locked at posting time. The worker can only earn proof-of-work if a real employer signs off and releases. So fake history requires fake employers willing to burn real wallet balance, which is self-defeating.

---

## Sign-in cheat sheet

| Tile | Role | When to use |
|---|---|---|
| **Bella Boutique** | Employer · ₦180,000 wallet · `9240078831` | The whole employer block (2:30 → 3:45) |
| **Amara Okafor** | Worker · Trust 86 · `9257836913` | The mature worker reveal (1:30 → 2:30) |
| Greenstack Foods | Employer · ₦215,000 | Backup if Bella's flow misfires |
| Tunde / Chiamaka | Workers | Backup worker profiles |

You can also navigate directly to `/worker/amara-okafor` without signing in — worker profiles are public.

## If something stalls (10-second recoveries)
- **Phone number is already taken** (a previous take used that number) → change the last 3 digits and retry, or skip onboarding and open `/worker/amara-okafor` directly.
- **Post-gig won't submit** → Bella's wallet may be empty after rehearsals. Sign in as **Greenstack Foods** instead.
- **Anything else** → go straight to `/worker/amara-okafor`, scroll the timeline, hit **Download CV**. That single screen carries the whole pitch.

## Practice checklist (do once before recording)
1. Pre-open the two tabs: `/onboard` and `/login`.
2. Confirm `/login` opens with the **I'm hiring** toggle highlighted (employer is the default).
3. Confirm the login page shows exactly 5 workers and 2 employers — no leftover rehearsal tiles. If you see extras, restore the seed by replacing `data/gigmark.json` with a clean copy.
4. Run the onboarding sequence once end-to-end (use a fresh phone like `+2348010000124`) so you know:
   - The chip clicks (Tailoring, Borrow for tools, Bank transfer) advance the convo
   - The GTBank partner mentions land naturally
   - The celebration view appears with the VA number
5. After the rehearsal account is created, remove that user from `data/gigmark.json` before the real take (or use a different phone for the take).
6. Run the post-gig flow once. Tick the **Tailoring** required-skills box so Amara ranks top. Make sure Bella's wallet is at ₦180,000 before you start. If you ran rehearsals, hit **Cancel gig and refund** on any test gigs you posted.
7. Click **Download CV** once and confirm the print dialog opens. Cancel cleanly.
