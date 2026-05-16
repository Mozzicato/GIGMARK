# Gigmark — Work → Identity → Financial Access

**A proof-of-work identity platform turning informal work into bankable credit.**

---

## What is Gigmark?

Gigmark transforms completed gigs into verified economic identity. Workers build trust scores, unlock AI-assisted onboarding, and access financial products (micro-loans, savings, insurance) — all without a credit history.

For employers, it's a trusted marketplace. For banks and lenders, it's a pipeline of verified, understandable borrowers.

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Squad sandbox account (https://sandbox.squadco.com/dashboard)
- Optional: Groq API key for AI onboarding (https://console.groq.com)

### Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your keys:
   # - SQUAD_SANDBOX_KEY (required for payments)
   # - GROQ_API_KEY (optional, for AI chat)
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## Demo Flow (2 minutes)

See [`demo.md`](./demo.md) for the full 5-minute walkthrough, or try this quick path:

1. **Worker Profile** — `/worker/amara-okafor`
   - See: Trust score (75), financial tier (Growth Ready), offers (3 bank products)
   
2. **AI Onboarding** — `/onboard`
   - See: Multi-step voice + text conversation, live offer sidebar
   
3. **Gig & Payment** — `/gig/g_demo_label`
   - See: 3 payment options (card, transfer, simulator)
   - Click "Simulate payment (demo)" if Squad is slow

4. **Demo Script** — `/demo-guide`
   - See: Full 2-min walkthrough with talking points and fallbacks

---

## Key Features

### 1. **Trust Scoring**
- Workers earn trust points from gig completion, ratings, payment history
- Visible on profile as live percentage
- Used to determine financial tier

### 2. **AI Onboarding** (Voice + Text)
- Groq LLM + fallback deterministic parsing
- 6 steps: identity → skills → goal → frequency → payout preference → review
- Live offer recommendations as profile builds

### 3. **Financial Profiling**
- 6-metric scoring: trust (28%), completion (18%), earnings (18%), liquidity (10%), rating (14%), activity (12%)
- Four tiers: Starter, Building, Growth Ready, Prime Ready
- Tier-specific bank offers (capital lines, equipment finance, etc.)

### 4. **Multi-Channel Payments**
- **Card** (via Squad hosted checkout)
- **Bank Transfer** (virtual account generation)
- **Payment Simulator** (localhost demo mode)

### 5. **Partner Ready**
- Financial API (`/api/users/[id]/stats`) — returns full profile + tier
- Partner pitch document for bank/lender conversations
- Revenue share model (15-25% on partner loan originations)

---

## API Reference

### Workers
```
GET  /api/users/[id]          → Worker profile
GET  /api/users/[id]/stats    → Worker with financial profile + offers
POST /api/users               → Create worker account (onboarding)
```

### Gigs
```
GET  /api/gigs                → List all gigs
GET  /api/gigs/[id]           → Gig detail + worker matches
PUT  /api/gigs/[id]           → Mark completed, set rating
POST /api/gigs                → Create new gig
```

### Payments
```
POST /api/payment/initiate    → Create Squad checkout session
POST /api/payment/simulate    → Demo payment (localhost only)
POST /api/payment/verify      → Verify transaction status
```

### Onboarding (AI Chat)
```
POST /api/onboarding/chat     → Send message, get reply + next step
```

---

## Project Structure

```
src/
  app/
    api/              # API routes
    onboard/          # Worker onboarding UI
    worker/[id]/      # Worker profile + financial twin
    gig/[id]/         # Gig detail + payment UI
    employer/         # Employer dashboard (stub)
    demo-guide/       # 2-min demo script (internal)
  lib/
    db.ts             # In-memory database (User, Gig, Transaction models)
    squad.ts          # Squad payment API wrapper
    financial.ts      # Financial scoring engine
    onboarding.ts     # Onboarding steps + offer logic
```

---

## Build & Deploy

### Local

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deploy to Vercel

This repo is configured to deploy to Vercel as-is. One-time setup:

1. **Import the repo** on [vercel.com/new](https://vercel.com/new) — pick `Mozzicato/GIGMARK`. Framework auto-detects as Next.js.
2. **Environment variables** — add these in the Vercel project settings *before* the first deploy:
   - `SQUAD_SANDBOX_KEY` — your Squad sandbox secret key (required for payments)
   - `APP_URL` — your Vercel URL once known, e.g. `https://gigmark-mozzicato.vercel.app` (used for the payment callback)
   - `GROQ_API_KEY` *(optional)* — enables the LLM onboarding path; without it, the deterministic parser handles everything
3. **Deploy.** First build takes ~2 minutes.
4. **Update Squad webhook URL** in your Squad sandbox dashboard to `https://YOUR-VERCEL-URL/api/payment/webhook` so settlements reconcile against the live deployment.

### How the database works on Vercel

The project uses a JSON-backed in-memory store. On serverless:

- The seed (`data/gigmark.json`) is **bundled into the build** — every cold start boots with the demo data: 5 workers, 2 employers, Bella's wallet at ₦180k.
- Writes (onboarding, escrow locks, releases) stay **in memory only**. They survive across requests on the same warm instance but reset on cold start.
- This is intentional for a demo deploy — judges always see clean state on first hit. For production, swap `src/lib/db.ts` for Vercel KV, Postgres, or any persistent store; the `db` API stays the same.

### Region

`vercel.json` pins functions to `fra1` (Frankfurt) — closest standard Vercel region to Nigeria. Change to your nearest region if you prefer.

---

## Environment Variables

See [`.env.example`](.env.example) for the full template. Required:

```env
SQUAD_SANDBOX_KEY=your_squad_secret_key
APP_URL=http://localhost:3000
```

Optional (for AI features):
```env
GROQ_API_KEY=your_groq_key
```

⚠️ **Never commit `.env.local` to version control.** The repo's `.gitignore` will protect it.

---

## Known Limitations & Fallbacks

| Feature | Status | Fallback |
|---------|--------|----------|
| Voice input | Web Speech API (Chrome/Edge) | Type message instead |
| Squad API | Requires internet | Use "Simulate payment" button (localhost) |
| Groq AI | ~500ms latency | Deterministic fallback parsing |
| Virtual accounts | Mocked in demo | Real Squad API in production |

---

## For Judges / Partners

- **Demo Script**: [`demo.md`](./demo.md) — 5-minute walkthrough with backup plans
- **Pitch Copy**: [`pitch_script.md`](./pitch_script.md) — 90-second and 2-minute verbal pitch
- **Partner Pitch**: [`PARTNER_PITCH.md`](./PARTNER_PITCH.md) — Bank/lender engagement document
- **Financial Model**: See `/src/lib/financial.ts` for scoring logic
- **API Docs**: See API Reference above

---

## Next Steps (Post-Hackathon)

1. **Live Banking Integration**
   - Wire real lender APIs (micro-credit, savings)
   - Implement approval workflows

2. **Fraud Prevention**
   - Add employer KYC
   - Implement dispute resolution

3. **Geographic Expansion**
   - Ghana, Kenya, Uganda onboarding
   - Multi-currency support

4. **Product Ecosystem**
   - Equipment financing
   - Insurance partnerships
   - Group savings programs

---

## Support

- **Questions?** Check [`PARTNER_PITCH.md`](./PARTNER_PITCH.md) or [`demo.md`](./demo.md)
- **Bug reports?** File an issue with steps to reproduce
- **Demo failing?** Check `.env.local` keys and network connection

---

**Gigmark: Turn work into identity. Turn identity into opportunity.**
