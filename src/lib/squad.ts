/**
 * Squad Payment Gateway Integration
 * Handles payment initialization, verification, and transaction management
 */
import crypto from "node:crypto";

const SANDBOX_BASE_URL = "https://sandbox-api-d.squadco.com";
const PRODUCTION_BASE_URL = "https://api-d.squadco.com";

export interface SquadPaymentRequest {
  amount: number;
  email: string;
  currency: "NGN" | "USD";
  transaction_ref: string;
  customer_name?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  pass_charge?: boolean;
  payment_channels?: string[];
}

export interface SquadPaymentResponse {
  status: number;
  message: string;
  data: {
    checkout_url: string;
    transaction_ref: string;
    transaction_amount: number;
    currency: string;
    merchant_info: {
      merchant_id: string;
      merchant_name?: string;
    };
    authorized_channels: string[];
  };
}

export interface SquadVerifyResponse {
  status: number;
  message: string;
  data: {
    transaction_ref: string;
    transaction_status: "success" | "pending" | "failed" | "abandoned";
    transaction_amount: number;
    merchant_amount: number;
    email: string;
    customer_name?: string;
    payment_type: string;
    created_at: string;
    meta?: Record<string, any>;
  };
}

export interface SquadDynamicVirtualAccountResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    account_name: string;
    account_number: string;
    expected_amount: string;
    expires_at: string;
    transaction_reference: string;
    bank: string;
    currency: string;
    is_blocked?: boolean;
  };
}

const getBaseUrl = (env: string = "sandbox"): string => {
  return env === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
};

const getSecretKey = (): string => {
  const key = process.env.SQUAD_SECRET_KEY || process.env.SQUAD_SANDBOX_KEY;
  if (!key) {
    throw new Error("Squad API secret key not configured. Set SQUAD_SECRET_KEY or SQUAD_SANDBOX_KEY.");
  }
  return key;
};

export async function initiatePayment(
  paymentRequest: SquadPaymentRequest,
  env: string = "sandbox"
): Promise<SquadPaymentResponse> {
  const baseUrl = getBaseUrl(env);
  const secretKey = getSecretKey();

  const response = await fetch(`${baseUrl}/transaction/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      ...paymentRequest,
      currency: paymentRequest.currency || "NGN",
      initiate_type: "inline",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Squad payment initiation failed: ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

export async function verifyTransaction(
  transactionRef: string,
  env: string = "sandbox"
): Promise<SquadVerifyResponse> {
  const baseUrl = getBaseUrl(env);
  const secretKey = getSecretKey();

  const response = await fetch(`${baseUrl}/transaction/verify/${transactionRef}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Squad transaction verification failed: ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

export async function simulateSandboxPayment(virtualAccountNumber: string, amount: number) {
  const secretKey = getSecretKey();

  const response = await fetch(`${SANDBOX_BASE_URL}/virtual-account/simulate/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      virtual_account_number: virtualAccountNumber,
      amount: String(amount),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Sandbox payment simulation failed: ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

export async function initiateDynamicVirtualAccount(
  payload: {
    amount: number;
    email: string;
    transaction_ref: string;
    duration: number;
  },
  env: string = "sandbox"
): Promise<SquadDynamicVirtualAccountResponse> {
  const baseUrl = getBaseUrl(env);
  const secretKey = getSecretKey();

  const response = await fetch(`${baseUrl}/virtual-account/initiate-dynamic-virtual-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Squad dynamic virtual account initiation failed: ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

export async function requeryDynamicVirtualAccount(
  transactionReference: string,
  env: string = "sandbox"
) {
  const baseUrl = getBaseUrl(env);
  const secretKey = getSecretKey();

  const response = await fetch(
    `${baseUrl}/virtual-account/get-dynamic-virtual-account-transactions/${transactionReference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Squad dynamic virtual account re-query failed: ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

export function verifySquadWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const digest = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex")
    .toUpperCase();

  return digest === signature.toUpperCase();
}

export function generateTransactionRef(gigId: string, timestamp = Date.now()): string {
  return `GIZ_${gigId}_${timestamp}`;
}
