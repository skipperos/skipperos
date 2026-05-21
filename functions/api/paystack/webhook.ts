import {
  firestoreGetDocument,
  firestorePatchDocument,
  fsInteger,
  fsString,
  fsTimestamp,
} from "../../_shared/firebaseAdmin";
import {
  getCustomerCode,
  getPlanFromPlanCode,
  getSubscriptionCode,
  verifyPaystackSignature,
} from "../../_shared/paystack";

async function findUidFromCustomer(env: any, customerCode: string) {
  if (!customerCode) return "";

  const customerDoc = await firestoreGetDocument(
    env,
    `paystackCustomers/${customerCode}`
  );

  return customerDoc?.fields?.uid?.stringValue || "";
}

async function processChargeSuccess(env: any, event: any) {
  const transaction = event.data;
  const reference = transaction.reference;

  if (!reference) return;

  const existingPayment = await firestoreGetDocument(env, `payments/${reference}`);

  if (existingPayment) {
    return;
  }

  const metadataUserId = transaction.metadata?.userId || "";
  const customerCode = getCustomerCode(transaction);
  const userId = metadataUserId || (await findUidFromCustomer(env, customerCode));

  if (!userId) {
    throw new Error("Could not resolve userId for charge.success.");
  }

  const planCode = transaction.plan?.plan_code || transaction.plan || "";
  const metadataPlan = transaction.metadata?.plan || "";
  const resolvedPlan = metadataPlan || getPlanFromPlanCode(planCode, env);
  const subscriptionCode = getSubscriptionCode(transaction);

  await firestorePatchDocument(env, `users/${userId}`, {
    plan: fsString(resolvedPlan),
    planStatus: fsString("active"),
    subscriptionCode: fsString(subscriptionCode),
    customerCode: fsString(customerCode),
    lastPaymentReference: fsString(reference),
    paidAt: fsTimestamp(),
    updatedAt: fsTimestamp(),
  });

  await firestorePatchDocument(env, `payments/${reference}`, {
    uid: fsString(userId),
    reference: fsString(reference),
    amount: fsInteger(transaction.amount || 0),
    currency: fsString(transaction.currency || "ZAR"),
    status: fsString(transaction.status || "success"),
    plan: fsString(resolvedPlan),
    eventType: fsString(event.event || "charge.success"),
    paystackCustomerCode: fsString(customerCode),
    paystackSubscriptionCode: fsString(subscriptionCode),
    createdAt: fsTimestamp(),
  });

  if (customerCode) {
    await firestorePatchDocument(env, `paystackCustomers/${customerCode}`, {
      uid: fsString(userId),
      customerCode: fsString(customerCode),
      plan: fsString(resolvedPlan),
      subscriptionCode: fsString(subscriptionCode),
      updatedAt: fsTimestamp(),
    });
  }
}

async function processSubscriptionCreate(env: any, event: any) {
  const data = event.data;
  const customerCode = getCustomerCode(data);
  const userId = data.metadata?.userId || (await findUidFromCustomer(env, customerCode));

  if (!userId) return;

  const planCode = data.plan?.plan_code || data.plan || "";
  const resolvedPlan = data.metadata?.plan || getPlanFromPlanCode(planCode, env);
  const subscriptionCode = getSubscriptionCode(data);

  await firestorePatchDocument(env, `users/${userId}`, {
    plan: fsString(resolvedPlan),
    planStatus: fsString("active"),
    subscriptionCode: fsString(subscriptionCode),
    customerCode: fsString(customerCode),
    updatedAt: fsTimestamp(),
  });
}

async function processSubscriptionDisabled(env: any, event: any) {
  const data = event.data;
  const customerCode = getCustomerCode(data);
  const userId = data.metadata?.userId || (await findUidFromCustomer(env, customerCode));

  if (!userId) return;

  await firestorePatchDocument(env, `users/${userId}`, {
    planStatus: fsString("cancelled"),
    updatedAt: fsTimestamp(),
  });
}

async function processInvoicePaymentFailed(env: any, event: any) {
  const data = event.data;
  const customerCode = getCustomerCode(data);
  const userId = data.metadata?.userId || (await findUidFromCustomer(env, customerCode));

  if (!userId) return;

  await firestorePatchDocument(env, `users/${userId}`, {
    planStatus: fsString("past_due"),
    updatedAt: fsTimestamp(),
  });
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const rawBody = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    const validSignature = await verifyPaystackSignature(
      env.PAYSTACK_SECRET_KEY,
      rawBody,
      signature
    );

    if (!validSignature) {
      return Response.json(
        { message: "Invalid Paystack signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      await processChargeSuccess(env, event);
    }

    if (event.event === "subscription.create") {
      await processSubscriptionCreate(env, event);
    }

    if (event.event === "subscription.disable") {
      await processSubscriptionDisabled(env, event);
    }

    if (event.event === "invoice.payment_failed") {
      await processInvoicePaymentFailed(env, event);
    }

    return Response.json({ received: true });
  } catch (error: any) {
    return Response.json(
      { message: error.message || "Webhook error." },
      { status: 500 }
    );
  }
}