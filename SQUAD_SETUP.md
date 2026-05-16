# Squad Payment Integration Setup Guide

## Status
✅ **Payment API integration is complete and deployed**

The app now includes three new payment endpoints:
- `POST /api/payment/initiate` — Start a gig payment
- `GET /api/payment/verify` — Check payment status
- `GET /payment-callback` — Handle Squad modal callback

---

## Step 1: Create a Squad Sandbox Account

1. Go to **https://sandbox.squadco.com/sign-up**
2. Sign up with your email
3. Verify your email
4. Log in to the dashboard
5. Navigate to **Settings > API Keys**
6. Copy your **Secret Key** (format: `sandbox_sk_...`)

---

## Step 2: Configure Environment Variables

1. Open the project root
2. Create a `.env.local` file (copy from `.env.example`):
   ```bash
   SQUAD_SANDBOX_KEY=your_secret_key_from_step_1
   APP_URL=http://localhost:3000
   ```

3. Save the file

---

## Step 3: Test the Payment Flow

### In the App:
1. Go to **Employer Dashboard** at `/employer/dashboard`
2. Click on an **Open Gig**
3. When you select a worker, the app will:
   - Call `POST /api/payment/initiate`
   - Receive a `checkout_url` from Squad
   - Open Squad's payment modal

### In Squad's Modal:
1. Click **Card** as the payment method
2. Use test card: **5200000000000007**
3. Any future expiry date (e.g., 12/30)
4. Any 3-digit CVV
5. Click **Pay**

### After Payment:
1. You're redirected to `/payment-callback`
2. The app verifies the payment with Squad
3. Gig status updates to **Completed**
4. Escrow is locked (₦ amount shown)

---

## Payment Flow in Gigmark

### When Employer Assigns a Worker:
```
1. Employer clicks "Assign to This Worker"
2. App calls POST /api/payment/initiate
3. Squad returns checkout_url
4. Payment modal opens
5. Employer completes payment with Squad
6. Redirect to /payment-callback
7. App verifies transaction
8. Gig status → "assigned" + escrow locked
```

### When Worker Completes Gig:
```
1. Worker marks gig as completed
2. Employer reviews and rates
3. Proof-of-Work record created
4. Escrow released to worker's wallet
5. Transaction recorded
```

---

## Test Scenarios

### ✅ Successful Payment
- Card: 5200000000000007
- Expiry: Any future date
- CVV: Any 3 digits
- Result: Transaction status = "success"

### ❌ Declined Payment
- Card: 4000000000000002
- Expiry: Any future date
- CVV: Any 3 digits
- Result: Transaction status = "failed"

### ⏳ Pending Payment (Transfer)
- Select "Transfer" option in payment modal
- Virtual account is generated
- Squad provides simulate endpoint (ready for webhooks)

---

## API Endpoints

### POST /api/payment/initiate
**Request:**
```json
{
  "gig_id": "g_abc123",
  "employer_id": "u_xyz789"
}
```

**Response:**
```json
{
  "checkout_url": "https://sandbox-pay.squadco.com/...",
  "transaction_ref": "GIZ_g_abc123_1715766800000",
  "amount": 35000,
  "currency": "NGN",
  "merchant_amount": 34650
}
```

### GET /api/payment/verify?transaction_ref=...
**Response:**
```json
{
  "transaction_status": "success",
  "amount": 35000,
  "merchant_amount": 34650,
  "email": "employer@mail.com",
  "payment_type": "card",
  "created_at": "2025-05-14T10:30:00Z"
}
```

---

## Going Live (Production)

When you're ready to accept real payments:

1. Sign up at **https://dashboard.squadco.com**
2. Complete KYC verification
3. Get your **Production Secret Key**
4. Update `.env.local`:
   ```bash
   SQUAD_SECRET_KEY=your_production_secret_key
   APP_URL=https://your-production-url.com
   ```
5. Change the environment in `/src/lib/squad.ts` from `"sandbox"` to `"production"`
6. Deploy to production

---

## Next Steps

- [ ] Create Squad sandbox account
- [ ] Copy your secret key
- [ ] Set `SQUAD_SANDBOX_KEY` in `.env.local`
- [ ] Test payment flow with test card
- [ ] Verify gig status updates correctly
- [ ] Test worker profile earnings updates

---

## Support

- **Squad Docs:** https://docs.squadco.com/
- **Squad Support:** help@squadco.com
- **Sandbox Dashboard:** https://sandbox.squadco.com

