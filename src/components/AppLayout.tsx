import {
  Anchor,
  Brain,
  ClipboardCheck,
  CreditCard,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  ShipWheel,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logoutUser } from "../services/authService";
import { auth } from "../services/firebase";
import {
  getPlanLabel,
  getTrialDaysLeft,
  getUserPlan,
} from "../services/paymentService";
import type { UserPlan } from "../services/paymentService";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Boats",
    to: "/boats",
    icon: ShipWheel,
  },
  {
    label: "Trips",
    to: "/trips",
    icon: ClipboardCheck,
  },
  {
    label: "Documents",
    to: "/documents",
    icon: FileText,
  },
  {
    label: "Fuel",
    to: "/fuel",
    icon: Fuel,
  },
  {
    label: "AI Reports",
    to: "/ai-report",
    icon: Brain,
  },
  {
    label: "Billing",
    to: "/billing",
    icon: CreditCard,
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    icon: Wrench,
  },
  {
    label: "Crew",
    to: "/crew",
    icon: Users,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

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
        console.error("App layout plan load error:", error);
      } finally {
        setLoadingPlan(false);
      }
    }

    loadPlan();
  }, []);

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          <SidebarContent
            onLogout={handleLogout}
            userPlan={userPlan}
            loadingPlan={loadingPlan}
          />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/40"
            />

            <aside className="relative h-full w-72 border-r border-slate-200 bg-white shadow-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-4 rounded-xl border border-slate-200 p-2 text-slate-600"
              >
                <X size={20} />
              </button>

              <SidebarContent
                onLogout={handleLogout}
                userPlan={userPlan}
                loadingPlan={loadingPlan}
              />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ocean-700 text-white">
                  <Anchor size={22} />
                </div>

                <div>
                  <p className="text-lg font-black text-slate-900">SkipperOS</p>
                  <p className="text-xs text-slate-500">Operator dashboard</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700"
              >
                <Menu size={22} />
              </button>
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <TrialIndicator userPlan={userPlan} loadingPlan={loadingPlan} compact />
            </div>
          </header>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}

function SidebarContent({
  onLogout,
  userPlan,
  loadingPlan,
}: {
  onLogout: () => void;
  userPlan: UserPlan | null;
  loadingPlan: boolean;
}) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-700 text-white">
            <Anchor size={24} />
          </div>

          <div>
            <p className="text-xl font-black text-slate-900">SkipperOS</p>
            <p className="text-xs text-slate-500">Small boat operations</p>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <TrialIndicator userPlan={userPlan} loadingPlan={loadingPlan} />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive
                  ? "bg-ocean-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-ocean-50 hover:text-ocean-900"
                }`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-900">Starter workspace</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Fleet, documents, fuel, trips, and reports in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

function TrialIndicator({
  userPlan,
  loadingPlan,
  compact = false,
}: {
  userPlan: UserPlan | null;
  loadingPlan: boolean;
  compact?: boolean;
}) {
  if (loadingPlan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-900">Checking plan...</p>
        <p className="mt-1 text-xs text-slate-500">Loading workspace status.</p>
      </div>
    );
  }

  const trialDaysLeft = getTrialDaysLeft(userPlan);
  const isTrialing = userPlan?.planStatus === "trialing" && trialDaysLeft > 0;
  const isActive = userPlan?.planStatus === "active";
  const isPastDue = userPlan?.planStatus === "past_due";
  const isCancelled = userPlan?.planStatus === "cancelled";

  if (isActive) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-black text-emerald-800">
          {getPlanLabel(userPlan?.plan)} plan active
        </p>
        {!compact && (
          <p className="mt-1 text-xs leading-5 text-emerald-700">
            Your subscription is active.
          </p>
        )}
      </div>
    );
  }

  if (isTrialing) {
    return (
      <div className="rounded-2xl border border-ocean-200 bg-ocean-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-ocean-900">
              Free trial active
            </p>
            <p className="mt-1 text-xs leading-5 text-ocean-700">
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean-700">
            Trial
          </span>
        </div>

        {!compact && (
          <Link
            to="/billing"
            className="mt-4 block rounded-xl bg-ocean-700 px-4 py-2 text-center text-sm font-bold text-white hover:bg-ocean-900"
          >
            Upgrade now
          </Link>
        )}
      </div>
    );
  }

  if (isPastDue) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-black text-amber-800">Payment issue</p>
        <p className="mt-1 text-xs leading-5 text-amber-700">
          Update billing to keep access.
        </p>

        {!compact && (
          <Link
            to="/billing"
            className="mt-4 block rounded-xl bg-amber-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-amber-700"
          >
            Fix billing
          </Link>
        )}
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-black text-red-800">Subscription cancelled</p>
        <p className="mt-1 text-xs leading-5 text-red-700">
          Subscribe again to restore access.
        </p>

        {!compact && (
          <Link
            to="/billing"
            className="mt-4 block rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700"
          >
            Reactivate
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-900">No active plan</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Choose a plan to activate SkipperOS.
      </p>

      {!compact && (
        <Link
          to="/billing"
          className="mt-4 block rounded-xl bg-ocean-700 px-4 py-2 text-center text-sm font-bold text-white hover:bg-ocean-900"
        >
          View plans
        </Link>
      )}
    </div>
  );
}