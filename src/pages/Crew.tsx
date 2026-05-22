import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { getCurrentUserSafe } from "../services/authUser";

import {
  getCrewForUser,
  getCrewLicenseStatus,
  getDaysUntilCrewLicenseExpiry,
} from "../services/crewService";
import type { CrewMember } from "../services/crewService";

export default function Crew() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrew() {
      const user = await getCurrentUserSafe();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCrewForUser(user.uid);
        setCrew(data);
      } catch (error) {
        console.error("Crew load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCrew();
  }, []);

  const availableCrew = crew.filter(
    (member) => member.availability === "Available"
  ).length;

  const expiringLicenses = crew.filter((member) => {
    const status = getCrewLicenseStatus(member.licenseExpiry);
    return status === "expired" || status === "expiring_soon";
  }).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Crew</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Crew manager
          </h1>
          <p className="mt-2 text-slate-600">
            Manage crew details, roles, availability, licenses, and emergency contacts.
          </p>
        </div>

        <Link
          to="/crew/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add crew
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <SummaryCard title="Total crew" value={String(crew.length)} />
        <SummaryCard title="Available" value={String(availableCrew)} />
        <SummaryCard title="License alerts" value={String(expiringLicenses)} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading crew...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching crew records and licenses.
            </p>
          </div>
        ) : crew.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <Users size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No crew members yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first crew member to track roles, contact details,
              certificates, availability, and emergency contacts.
            </p>

            <Link
              to="/crew/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first crew member
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {crew.map((member) => {
              const licenseStatus = getCrewLicenseStatus(member.licenseExpiry);
              const daysUntilExpiry = getDaysUntilCrewLicenseExpiry(
                member.licenseExpiry
              );

              return (
                <div
                  key={member.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                    <Users size={25} />
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {member.fullName}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {member.role}
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <Info label="Availability" value={member.availability} />
                    <Info label="Phone" value={member.phone || "Not added"} />
                    <Info label="Email" value={member.email || "Not added"} />
                    <Info
                      label="Certificate"
                      value={member.licenseName || "Not added"}
                    />
                    <Info
                      label="Expiry"
                      value={formatDate(member.licenseExpiry)}
                    />
                  </div>

                  {member.emergencyContactName && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Emergency contact
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {member.emergencyContactName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {member.emergencyContactPhone || "No phone added"}
                      </p>
                    </div>
                  )}

                  {member.notes && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {member.notes}
                      </p>
                    </div>
                  )}

                  <div
                    className={`mt-6 rounded-xl px-4 py-3 text-sm font-bold ${getLicenseStatusClass(
                      licenseStatus
                    )}`}
                  >
                    {getLicenseStatusText(licenseStatus, daysUntilExpiry)}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to="/crew/add"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add another
                    </Link>

                    <Link
                      to="/trips/add"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add trip
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not added";

  return new Date(value).toLocaleDateString();
}

function getLicenseStatusClass(status: string) {
  if (status === "expired") return "bg-red-50 text-red-700";
  if (status === "expiring_soon") return "bg-amber-50 text-amber-700";
  if (status === "no_expiry") return "bg-slate-50 text-slate-700";

  return "bg-emerald-50 text-emerald-700";
}

function getLicenseStatusText(status: string, daysUntilExpiry: number | null) {
  if (status === "expired") return "License expired";
  if (status === "expiring_soon") {
    return `License expiring soon: ${daysUntilExpiry} days left`;
  }
  if (status === "no_expiry") return "No license expiry added";

  return `License valid: ${daysUntilExpiry} days left`;
}