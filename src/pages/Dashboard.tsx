import { useEffect, useState } from "react";
import {
  Brain,
  CalendarDays,
  ClipboardCheck,
  FileWarning,
  Fuel,
  Plus,
  ShipWheel,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

import { auth } from "../services/firebase";

import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";

import { getTripsForUser } from "../services/tripService";
import type { Trip } from "../services/tripService";

import {
  getMaintenanceDueStatus,
  getMaintenanceTasksForUser,
} from "../services/maintenanceService";
import type { MaintenanceTask } from "../services/maintenanceService";

import {
  getDocumentStatus,
  getDocumentsForUser,
} from "../services/documentService";
import type { VesselDocument } from "../services/documentService";

import { getCrewForUser } from "../services/crewService";
import type { CrewMember } from "../services/crewService";

import { getFuelRecordsForUser } from "../services/fuelService";
import type { FuelRecord } from "../services/fuelService";

import { getTrialDaysLeft, getUserPlan } from "../services/paymentService";
import type { UserPlan } from "../services/paymentService";

export default function Dashboard() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [documents, setDocuments] = useState<VesselDocument[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [
          userBoats,
          userTrips,
          userMaintenance,
          userDocuments,
          userCrew,
          userFuelRecords,
          currentUserPlan,
        ] = await Promise.all([
          getBoatsForUser(user.uid),
          getTripsForUser(user.uid),
          getMaintenanceTasksForUser(user.uid),
          getDocumentsForUser(user.uid),
          getCrewForUser(user.uid),
          getFuelRecordsForUser(user.uid),
          getUserPlan(user.uid),
        ]);

        setBoats(userBoats);
        setTrips(userTrips);
        setMaintenanceTasks(userMaintenance);
        setDocuments(userDocuments);
        setCrew(userCrew);
        setFuelRecords(userFuelRecords);
        setUserPlan(currentUserPlan);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const tripsThisMonth = trips.filter((trip) => {
    if (!trip.departureTime) return false;

    const tripDate = new Date(trip.departureTime);
    const now = new Date();

    return (
      tripDate.getMonth() === now.getMonth() &&
      tripDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const maintenanceDue = maintenanceTasks.filter((task) => {
    const status = getMaintenanceDueStatus(task);
    return status === "overdue" || status === "due_soon";
  }).length;

  const documentAlerts = documents.filter((document) => {
    const status = getDocumentStatus(document.expiryDate);
    return status === "expired" || status === "expiring_soon";
  }).length;

  const totalFuelCost = fuelRecords.reduce(
    (sum, record) => sum + Number(record.totalCost || 0),
    0
  );

  const totalFuelQuantity = fuelRecords.reduce(
    (sum, record) => sum + Number(record.quantity || 0),
    0
  );

  const stats = [
    {
      title: "Boats",
      value: loading ? "..." : String(boats.length),
      icon: ShipWheel,
      text: "Active vessel profiles",
    },
    {
      title: "Trips this month",
      value: loading ? "..." : String(tripsThisMonth),
      icon: ClipboardCheck,
      text: "Operational records",
    },
    {
      title: "Crew members",
      value: loading ? "..." : String(crew.length),
      icon: Users,
      text: "People in your roster",
    },
    {
      title: "Maintenance due",
      value: loading ? "..." : String(maintenanceDue),
      icon: Wrench,
      text: "Due soon or overdue",
    },
    {
      title: "Document alerts",
      value: loading ? "..." : String(documentAlerts),
      icon: FileWarning,
      text: "Expired or expiring soon",
    },
    {
      title: "Fuel records",
      value: loading ? "..." : String(fuelRecords.length),
      icon: Fuel,
      text: `${totalFuelQuantity.toFixed(2)} units recorded`,
    },
  ];

  const recentTrips = trips.slice(0, 3);
  const recentMaintenance = maintenanceTasks.slice(0, 3);
  const recentDocuments = documents.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Dashboard</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Fleet command center
          </h1>
          <p className="mt-2 text-slate-600">
            Real-time overview of boats, trips, documents, fuel, maintenance,
            and crew.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/trips/add"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Add trip
          </Link>

          <Link
            to="/boats/add"
            className="rounded-xl bg-ocean-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-ocean-900"
          >
            Add boat
          </Link>
        </div>
      </div>

      <TrialBanner userPlan={userPlan} />

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-ocean-900 to-slate-950 p-8 text-white">
        <p className="text-sm font-bold text-ocean-100">Welcome to SkipperOS</p>

        <h2 className="mt-2 text-3xl font-black md:text-4xl">
          Your small-boat operating system.
        </h2>

        <p className="mt-3 max-w-2xl text-slate-300">
          Replace paper logs, WhatsApp chaos, spreadsheets, and forgotten
          maintenance with clean operational records.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MiniStat
            title="Total fuel cost"
            value={loading ? "..." : totalFuelCost.toFixed(2)}
          />
          <MiniStat
            title="Total trips"
            value={loading ? "..." : String(trips.length)}
          />
          <MiniStat
            title="Open maintenance"
            value={
              loading
                ? "..."
                : String(
                  maintenanceTasks.filter((task) => task.status !== "Completed")
                    .length
                )
            }
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                <Icon size={22} />
              </div>

              <p className="text-sm font-semibold text-slate-500">
                {stat.title}
              </p>

              <p className="mt-2 text-3xl font-black text-slate-900">
                {stat.value}
              </p>

              <p className="mt-1 text-sm text-slate-500">{stat.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Your boats</h2>
              <p className="mt-2 text-sm text-slate-600">
                Recently added vessel profiles.
              </p>
            </div>

            <Link
              to="/boats/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-4 py-2 text-sm font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={16} />
              Add boat
            </Link>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm font-semibold text-slate-500">
                Loading boats...
              </p>
            ) : boats.length === 0 ? (
              <EmptyBox
                icon={ShipWheel}
                title="No boats yet"
                text="Add your first boat to activate trips, documents, maintenance, and fuel tracking."
                buttonText="Add first boat"
                to="/boats/add"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {boats.slice(0, 4).map((boat) => (
                  <div
                    key={boat.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-ocean-700">
                        <ShipWheel size={22} />
                      </div>

                      <div>
                        <h3 className="font-black text-slate-900">
                          {boat.boatName}
                        </h3>

                        <p className="text-sm font-semibold text-slate-500">
                          {boat.vesselType}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {boat.homePort}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {boats.length > 4 && (
            <div className="mt-5">
              <Link
                to="/boats"
                className="text-sm font-bold text-ocean-700 hover:text-ocean-900"
              >
                View all boats →
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Quick actions</h2>

          <p className="mt-2 text-sm text-slate-600">
            Start building operational records for your fleet.
          </p>

          <div className="mt-6 grid gap-3">
            <QuickAction
              to="/trips/add"
              icon={CalendarDays}
              title="Add trip log"
              text="Record a completed operation."
            />

            <QuickAction
              to="/maintenance/add"
              icon={Wrench}
              title="Add maintenance"
              text="Track repairs and service tasks."
            />

            <QuickAction
              to="/crew/add"
              icon={Users}
              title="Add crew member"
              text="Save crew details and licenses."
            />

            <QuickAction
              to="/documents/add"
              icon={FileWarning}
              title="Add documents"
              text="Track permits, certificates, and expiry dates."
            />

            <QuickAction
              to="/fuel/add"
              icon={Fuel}
              title="Fuel tracking"
              text="Track fuel purchases, cost, and engine hours."
            />

            <QuickAction
              to="/ai-report"
              icon={Brain}
              title="AI log generator"
              text="Turn rough notes into a clean report."
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <RecentPanel
          title="Recent trips"
          emptyText="No trip logs yet."
          linkText="View trips"
          linkTo="/trips"
        >
          {recentTrips.map((trip) => (
            <SmallRecord
              key={trip.id}
              title={trip.boatName}
              subtitle={trip.tripType}
              meta={formatDateTime(trip.departureTime)}
            />
          ))}
        </RecentPanel>

        <RecentPanel
          title="Maintenance watch"
          emptyText="No maintenance tasks yet."
          linkText="View maintenance"
          linkTo="/maintenance"
        >
          {recentMaintenance.map((task) => (
            <SmallRecord
              key={task.id}
              title={task.title}
              subtitle={task.boatName}
              meta={task.status}
            />
          ))}
        </RecentPanel>

        <RecentPanel
          title="Document watch"
          emptyText="No documents yet."
          linkText="View documents"
          linkTo="/documents"
        >
          {recentDocuments.map((document) => (
            <SmallRecord
              key={document.id}
              title={document.documentName}
              subtitle={document.boatName}
              meta={formatDate(document.expiryDate)}
            />
          ))}
        </RecentPanel>
      </div>
    </section>
  );
}

function TrialBanner({ userPlan }: { userPlan: UserPlan | null }) {
  const trialDaysLeft = getTrialDaysLeft(userPlan);
  const isTrialing = userPlan?.planStatus === "trialing" && trialDaysLeft > 0;
  const isActive = userPlan?.planStatus === "active";

  if (isActive) {
    return (
      <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
          Subscription active
        </p>

        <h2 className="mt-2 text-2xl font-black text-emerald-950">
          Your SkipperOS workspace is fully active.
        </h2>

        <p className="mt-2 text-emerald-800">
          Your paid subscription is active and your operational records are unlocked.
        </p>
      </div>
    );
  }

  if (!isTrialing) return null;

  return (
    <div className="mt-8 rounded-3xl border border-ocean-200 bg-ocean-50 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-ocean-700">
            Free trial active
          </p>

          <h2 className="mt-2 text-2xl font-black text-ocean-950">
            You have {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in
            your trial.
          </h2>

          <p className="mt-2 text-ocean-800">
            Keep using SkipperOS during your trial. Upgrade before it ends to keep access.
          </p>
        </div>

        <Link
          to="/billing"
          className="rounded-xl bg-ocean-700 px-5 py-3 text-center font-bold text-white hover:bg-ocean-900"
        >
          Upgrade now
        </Link>
      </div>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-ocean-700 hover:bg-ocean-50"
    >
      <Icon className="text-ocean-700" size={22} />

      <div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </Link>
  );
}

function EmptyBox({
  icon: Icon,
  title,
  text,
  buttonText,
  to,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  buttonText: string;
  to: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <Icon className="mx-auto text-ocean-700" size={32} />

      <h3 className="mt-4 font-black text-slate-900">{title}</h3>

      <p className="mt-2 text-sm text-slate-600">{text}</p>

      <Link
        to={to}
        className="mt-5 inline-flex rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
      >
        {buttonText}
      </Link>
    </div>
  );
}

function RecentPanel({
  title,
  emptyText,
  linkText,
  linkTo,
  children,
}: {
  title: string;
  emptyText: string;
  linkText: string;
  linkTo: string;
  children: React.ReactNode;
}) {
  const hasChildren = Boolean(
    Array.isArray(children) ? children.length : children
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-900">{title}</h2>

        <Link
          to={linkTo}
          className="text-sm font-bold text-ocean-700 hover:text-ocean-900"
        >
          {linkText}
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {hasChildren ? (
          children
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}

function SmallRecord({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle: string;
  meta: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {meta}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "Not added";
  return new Date(value).toLocaleString();
}

function formatDate(value: string) {
  if (!value) return "Not added";
  return new Date(value).toLocaleDateString();
}