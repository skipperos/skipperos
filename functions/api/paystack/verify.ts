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
} from "../../_shared/paystack";

export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return Response.json(
        { message: "Missing transaction reference." },
        { status: 400 }
      );
    }

    const paymentDocPath = `payments/${reference}`;
    const existingPayment = await firestoreGetDocument(env, paymentDocPath);

    if (existingPayment) {
      return Response.json({
        status: "success",
        message: "Payment already processed.",
      });
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result: any = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status) {
      return Response.json(
        { message: result.message || "Paystack verification failed." },
        { status: 400 }
      );
    }

    const transaction = result.data;

    if (transaction.status !== "success") {
      return Response.json(
        { status: transaction.status, message: "Payment was not successful." },
        { status: 400 }
      );
    }

    const userId = transaction.metadata?.userId;
    const selectedPlan = transaction.metadata?.plan;
    const planCode = transaction.plan?.plan_code || transaction.plan || "";
    const resolvedPlan = selectedPlan || getPlanFromPlanCode(planCode, env);

    if (!userId) {
      return Response.json(
        { message: "Missing userId in transaction metadata." },
        { status: 400 }
      );
    }

    const customerCode = getCustomerCode(transaction);
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

    await firestorePatchDocument(env, paymentDocPath, {
      uid: fsString(userId),
      reference: fsString(reference),
      amount: fsInteger(transaction.amount || 0),
      currency: fsString(transaction.currency || "ZAR"),
      status: fsString(transaction.status || "success"),
      plan: fsString(resolvedPlan),
      eventType: fsString("verify.redirect"),
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

    return Response.json({
      status: "success",
      message: "Payment verified and subscription activated.",
    });
  } catch (error: any) {
    return Response.json(
      { message: error.message || "Server error." },
      { status: 500 }
    );
  }
}