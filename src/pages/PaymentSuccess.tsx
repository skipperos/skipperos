import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    "checking"
  );
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setStatus("failed");
        setMessage("Missing Paystack transaction reference.");
        return;
      }

      try {
        const response = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference)}`
        );

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Payment could not be verified.");
        }

        setStatus("success");
        setMessage(
          "Payment verified. Your SkipperOS subscription is being activated."
        );
      } catch (err: any) {
        setStatus("failed");
        setMessage(err.message || "Payment verification failed.");
      }
    }

    verifyPayment();
  }, [reference]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "checking" && (
          <>
            <Loader2 className="mx-auto animate-spin text-ocean-700" size={52} />
            <h1 className="mt-5 text-3xl font-black text-slate-900">
              Verifying payment
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto text-emerald-600" size={56} />
            <h1 className="mt-5 text-3xl font-black text-slate-900">
              Payment successful
            </h1>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="mx-auto text-red-600" size={56} />
            <h1 className="mt-5 text-3xl font-black text-slate-900">
              Payment issue
            </h1>
          </>
        )}

        <p className="mt-3 text-slate-600">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="rounded-xl bg-ocean-700 px-6 py-3 font-bold text-white hover:bg-ocean-900"
          >
            Go to dashboard
          </Link>

          <Link
            to="/billing"
            className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            View billing
          </Link>
        </div>
      </div>
    </main>
  );
}