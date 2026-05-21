import { getPlanCodeFromPlan } from "../../_shared/paystack";

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const { email, userId, plan } = body;

    if (!email || !userId || !plan) {
      return Response.json(
        { message: "Missing email, userId, or plan." },
        { status: 400 }
      );
    }

    const planCode = getPlanCodeFromPlan(plan, env);

    if (!planCode) {
      return Response.json(
        { message: "Invalid plan selected." },
        { status: 400 }
      );
    }

    const callbackUrl = `${new URL(request.url).origin}/payment-success`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: 100,
          currency: "ZAR",
          plan: planCode,
          callback_url: callbackUrl,
          metadata: {
            userId,
            plan,
            product: "SkipperOS",
          },
        }),
      }
    );

    const result: any = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status) {
      return Response.json(
        { message: result.message || "Paystack initialization failed." },
        { status: 400 }
      );
    }

    return Response.json({
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: result.data.reference,
    });
  } catch (error: any) {
    return Response.json(
      { message: error.message || "Server error." },
      { status: 500 }
    );
  }
}