import { useEffect, useState } from "react";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { auth } from "../services/firebase";
import {
  getPlanLabel,
  getPlanStatusLabel,
  getUserPlan,
} from "../services/paymentService";
import type { PlanKey, UserPlan } from "../services/paymentService";
import { getTrialDaysLeft } from "../services/paymentService";

const plans: {
  key: PlanKey;
  name: string;
  price: string;
  description: string;
  highlighted?: boolean;
  features: string[];
}[] = [
    {
      key: "starter",
      name: "Starter",
      price: "$29",
      description: "For single-boat operators getting organized.",
      features: [
        "1 boat workspace",
        "Trip logs",
        "Documents",
        "Fuel tracking",
        "Maintenance",
        "Crew manager",
        "AI report generator",
      ],
    },
    {
      key: "fleet",
      name: "Fleet",
      price: "$79",
      description: "For growing teams running multiple vessels.",
      highlighted: true,
      features: [
        "Multi-vessel operations",
        "Trip and fuel history",
        "Document alerts",
        "Maintenance watch",
        "Crew records",
        "AI reports",
        "Best for 2–5 boats",
      ],
    },
    {
      key: "pro",
      name: "Operator Pro",
      price: "$149",
      description: "For serious operators with higher admin pressure.",
      features: [
        "Advanced fleet workspace",
        "Compliance-ready records",
        "Priority operating modules",
        "Maintenance oversight",
        "Crew license tracking",
        "AI reporting",
        "Best for larger operators",
      ],
    },
  ];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("starter");
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [startingPayment, setStartingPayment] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlan() {
      const user = auth.currentUser;

      if (!user) {
        setLoadingPlan(false);
        return;
      }

      try {
        const plan = await getUserPlan(user.uid);
        setUserPlan(plan);
      } catch (error) {
        console.error("Billing plan load error:", error);
      } finally {
        setLoadingPlan(false);
      }
    }

    loadPlan();
  }, []);

  async function handleStartSubscription(plan: PlanKey) {
    setError("");
    setSelectedPlan(plan);

    const user = auth.currentUser;

    if (!user || !user.email) {
      setError("Please login before continuing to payment.");
      return;
    }

    setStartingPayment(true);

    try {
      const response = await fetch("/api/paystack/initialize-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.uid,
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.authorization_url) {
        throw new Error(data.message || "Could not start subscription.");
      }

      window.location.href = data.authorization_url;
    } catch (err: any) {
      setError(err.message || "Could not start subscription.");
    } finally {
      setStartingPayment(false);
    }
  }

  const activePlan = getPlanLabel(userPlan?.plan);
  const planStatus = getPlanStatusLabel(userPlan?.planStatus);
  const isActive = userPlan?.planStatus === "active";
  const trialDaysLeft = getTrialDaysLeft(userPlan);
  const isTrialing = userPlan?.planStatus === "trialing" && trialDaysLeft > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Billing</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            SkipperOS subscriptions
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Choose a monthly plan to unlock all features.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {loadingPlan ? (
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-bold">Checking plan...</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-500">Current plan</p>
              <p className="mt-1 text-xl font-black text-slate-900">
                {activePlan}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
                  }`}
              >
                {planStatus}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-ocean-900 to-slate-950 p-8 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-ocean-100">
          <ShieldCheck size={26} />
        </div>

        <h2 className="mt-5 text-3xl font-black md:text-4xl">
          billing plans.
        </h2>

        <p className="mt-3 max-w-2xl text-slate-300">
          subscription activation is
          handled by Paystack.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan =
            userPlan?.plan === plan.key && userPlan?.planStatus === "active";
          {
            isTrialing && (
              <p className="mt-3 rounded-xl bg-ocean-50 px-4 py-3 text-sm font-bold text-ocean-700">
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your free trial.
              </p>
            )
          }

          return (
            <div
              key={plan.key}
              className={`rounded-3xl border p-7 shadow-sm ${plan.highlighted
                ? "border-ocean-700 bg-ocean-900 text-white"
                : "border-slate-200 bg-white text-slate-900"
                }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${plan.highlighted
                    ? "bg-white/10 text-ocean-100"
                    : "bg-ocean-50 text-ocean-700"
                    }`}
                >
                  {plan.highlighted ? <Star size={25} /> : <CreditCard size={25} />}
                </div>

                {isCurrentPlan && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    <CheckCircle size={14} />
                    Current
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-2xl font-black">{plan.name}</h2>

              <p
                className={`mt-2 text-sm ${plan.highlighted ? "text-ocean-100" : "text-slate-600"
                  }`}
              >
                {plan.description}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{plan.price}</span>
                <span
                  className={`pb-2 font-semibold ${plan.highlighted ? "text-ocean-100" : "text-slate-500"
                    }`}
                >
                  /month
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm font-semibold">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleStartSubscription(plan.key)}
                disabled={startingPayment || isCurrentPlan}
                className={`mt-8 w-full rounded-xl px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 ${plan.highlighted
                  ? "bg-white text-ocean-900"
                  : "bg-ocean-700 text-white hover:bg-ocean-900"
                  }`}
              >
                {isCurrentPlan
                  ? "Active plan"
                  : startingPayment && selectedPlan === plan.key
                    ? "Starting checkout..."
                    : "Subscribe with Paystack"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}