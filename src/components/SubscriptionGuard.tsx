import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getUserPlan, hasValidAccess } from "../services/paymentService";
import type { UserPlan } from "../services/paymentService";

export default function SubscriptionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const user = auth.currentUser;

      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const plan = await getUserPlan(user.uid);
        setUserPlan(plan);
      } catch (error) {
        console.error("Subscription check error:", error);
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-ocean-700" size={20} />
            <div>
              <p className="font-bold text-slate-900">Checking access...</p>
              <p className="mt-1 text-sm text-slate-500">
                Verifying trial or subscription status.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!hasValidAccess(userPlan)) {
    return <Navigate to="/billing" replace />;
  }

  return children;
}