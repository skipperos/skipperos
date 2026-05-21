export type PaystackEnv = {
  PAYSTACK_SECRET_KEY: string;
};

export async function verifyPaystackSignature(
  secretKey: string,
  rawBody: string,
  signature: string | null
) {
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  );

  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hash === signature;
}

export function getCustomerCode(data: any) {
  if (!data?.customer) return "";

  if (typeof data.customer === "string") {
    return data.customer;
  }

  return data.customer.customer_code || "";
}

export function getSubscriptionCode(data: any) {
  if (!data) return "";

  if (typeof data.subscription === "string") {
    return data.subscription;
  }

  return (
    data.subscription?.subscription_code ||
    data.subscription_code ||
    ""
  );
}

export function getPlanFromPlanCode(planCode: string, env: any) {
  if (planCode === env.PAYSTACK_STARTER_PLAN_CODE) return "starter";
  if (planCode === env.PAYSTACK_FLEET_PLAN_CODE) return "fleet";
  if (planCode === env.PAYSTACK_PRO_PLAN_CODE) return "pro";

  return "unknown";
}

export function getPlanCodeFromPlan(plan: string, env: any) {
  if (plan === "starter") return env.PAYSTACK_STARTER_PLAN_CODE;
  if (plan === "fleet") return env.PAYSTACK_FLEET_PLAN_CODE;
  if (plan === "pro") return env.PAYSTACK_PRO_PLAN_CODE;

  return "";
}