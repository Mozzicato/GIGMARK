# Squad Integration Notes

Gigmark uses Squad as the payment rail behind a **wallet-based escrow model**. Every Gigmark user (worker or employer) has one permanent virtual account number tied to their wallet. Squad powers the money movement that funds that wallet. Gigmark handles the trust + escrow layer on top.

## How Squad shows up in the product

| Surface | What Squad does | Where |
|---|---|---|
| Employer wallet top-up via card | Hosted checkout, transaction verification | Gig page → *Need to top up?* details panel |
| Employer wallet top-up via transfer | Dynamic virtual account (DVA) generation | Same panel → *Generate transfer account* |
| Sandbox simulation | DVA payment simulator for testing | Same panel → *Simulate sandbox top-up* (localhost only) |
| Post-payment confirmation | Webhook signature verification | `/api/payment/webhook` |
| Escrow lock / release / refund | Local wallet bookkeeping | Gig API + accounts library |

The user-visible escrow flow (post gig → lock escrow → release on completion → refund on cancel) is **wallet-based**. Squad is the rail that gets money *into* the wallet. Once it's in the wallet, Gigmark moves it around internally.

## Implemented endpoints

| Route | Squad helper | Purpose |
|---|---|---|
| `POST /api/payment/initiate` | `initiatePayment()` | Hosted checkout session; supports `channel: "card" \| "transfer"` |
| `POST /api/payment/virtual-account` | `initiateDynamicVirtualAccount()` | Generate a DVA for transfer-based funding |
| `GET /api/payment/virtual-account?transaction_ref=…` | `requeryDynamicVirtualAccount()` | Re-query a DVA transaction |
| `GET /api/payment/verify?transaction_ref=…` | `verifyTransaction()` | Confirm a transaction after checkout |
| `POST /api/payment/simulate` | `simulateSandboxPayment()` | Sandbox-only DVA payment simulator |
| `POST /api/payment/webhook` | `verifySquadWebhookSignature()` | Webhook signature check + local escrow update |
| `GET /payment-callback` | — | Post-checkout redirect handler |

All helpers live in [`src/lib/squad.ts`](src/lib/squad.ts).

## Squad sandbox status on this merchant

| Feature | Sandbox status | Notes |
|---|---|---|
| Hosted checkout (`/transaction/initiate`) | **Working** | Returns real `sandbox-pay.squadco.com` URL. Test cards listed below. |
| Transaction verification (`/transaction/verify/:ref`) | **Working** | |
| DVA creation (`/virtual-account/initiate-dynamic-virtual-account`) | **Disabled** on this merchant | Squad responds `"You are not profile for this feature"`. Needs Squad to enable. |
| DVA payment simulator (`/virtual-account/simulate/payment`) | Available to all sandbox users per [docs](https://docs.squadco.com/Virtual-accounts/api-specifications/#simulate-payment) | Currently moot here because DVA creation itself is blocked. |

### Local fallback for DVA
Because DVA is disabled on this sandbox merchant, [`/api/payment/virtual-account`](src/app/api/payment/virtual-account/route.ts) catches the Squad error and returns a **locally generated sandbox-fallback account** (10-digit number, GTBank, 15-min expiry). The response includes `sandbox_fallback: true` so the UI knows. When Squad enables DVA on this merchant, the real path takes over automatically — no code change.

### Sandbox test cards (hosted checkout)
| Card | Flow | Notes |
|---|---|---|
| `4242 4242 4242 4242` | OTP only | Use amount **< ₦7,500** |
| `5555 5555 5555 4444` | PIN + OTP | Two-step |
| `5200 0000 0000 1096` | 3DS challenge | Full 3DS flow |

PIN `1234` · OTP `123456` · any future expiry · any 3-digit CVV.

## Permanent virtual accounts (Gigmark layer)

Each user has a permanent account number stored on the user record:
- `virtual_account_number` (string)
- `virtual_account_bank` (always `GTBank` to match the Squad sandbox surface)
- `virtual_account_name` (`<user> (Gigmark Escrow)` or `<user> (Gigmark Payout)`)

These are deterministically generated from the user id in [`src/lib/accounts.ts`](src/lib/accounts.ts). New users get one auto-assigned at signup. Existing users got backfilled via [`/api/admin/backfill-accounts`](src/app/api/admin/backfill-accounts/route.ts).

> Once Squad enables DVA on this merchant, the assignment function can be swapped to provision a real Squad-issued DVA per user at signup. The product surface area doesn't change.

## Webhook handling

[`/api/payment/webhook`](src/app/api/payment/webhook/route.ts):
- Validates `x-squad-signature` against an HMAC SHA-512 of the raw body keyed by the secret.
- Marks local escrow `success` or `failed` based on event status.
- This is the production confirmation path that doesn't rely on browser redirects.

## Environment variables

```
SQUAD_SANDBOX_KEY=sandbox_sk_...   # sandbox testing
SQUAD_SECRET_KEY=...               # production
APP_URL=http://localhost:3000      # checkout callback target
```

## Known fixes already applied
- Customer email format is `${userId}@gigmark.app` (Squad rejects `.local` TLD).
- Simulate-payment body uses `amount: String(amount)` (Squad docs require String).
- Removed the undocumented `dva: true` flag from the simulator body.
- Onboarding LLM call upgraded to `llama-3.3-70b-versatile` (the previous `llama-3.1-70b-versatile` was deprecated by Groq).

## Not yet done
- Direct outbound transfer to a worker bank account (no KYC / transfer recipient data on the user model yet).
- Real Squad-issued DVAs per user — blocked on Squad enabling DVA on this merchant profile.
- Production webhook event-schema mapping and audit logging.

## How to enable real DVAs
1. From the merchant email registered on Squad sandbox, email `help@squadco.com` (cc `growth@habaripay.com`) asking to enable Dynamic Virtual Accounts on the account. Include the merchant id (visible on hosted checkout responses — for this build it's `SBP71DAUT3`) and the sandbox public key.
2. Once enabled, the existing code path in [`/api/payment/virtual-account`](src/app/api/payment/virtual-account/route.ts) will get real accounts back from Squad instead of falling back. No code change needed.
3. The simulator endpoint (`/virtual-account/simulate/payment`) is then immediately usable to verify the loop without real money.
