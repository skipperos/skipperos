import { useEffect, useState } from "react";
import { Fuel as FuelIcon, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { getFuelRecordsForUser } from "../services/fuelService";
import type { FuelRecord } from "../services/fuelService";
import { getCurrentUserSafe } from "../services/authUser";

export default function Fuel() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFuelRecords() {
      const user = await getCurrentUserSafe();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getFuelRecordsForUser(user.uid);
        setFuelRecords(data);
      } catch (error) {
        console.error("Fuel records load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFuelRecords();
  }, []);

  const totalFuel = fuelRecords.reduce(
    (sum, record) => sum + Number(record.quantity || 0),
    0
  );

  const totalCost = fuelRecords.reduce(
    (sum, record) => sum + Number(record.totalCost || 0),
    0
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Fuel tracking</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Fuel purchases, costs, and vessel usage
          </h1>
          <p className="mt-2 text-slate-600">
            Track fuel records, engine hours, total cost, and vessel fuel history.
          </p>
        </div>

        <Link
          to="/fuel/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add fuel
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <SummaryCard title="Total fuel recorded" value={totalFuel.toFixed(2)} />
        <SummaryCard title="Total fuel cost" value={totalCost.toFixed(2)} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading fuel records...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching your fuel purchase and usage history.
            </p>
          </div>
        ) : fuelRecords.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <FuelIcon size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No fuel records yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add fuel records to track vessel operating costs, fuel usage,
              supplier notes, and engine-hour history.
            </p>

            <Link
              to="/fuel/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first fuel record
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fuelRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                  <FuelIcon size={25} />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  {record.boatName}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {record.fuelType}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <Info label="Date" value={formatDate(record.fuelDate)} />
                  <Info label="Quantity" value={`${record.quantity} units`} />
                  <Info
                    label="Price/unit"
                    value={Number(record.pricePerUnit || 0).toFixed(2)}
                  />
                  <Info
                    label="Total cost"
                    value={Number(record.totalCost || 0).toFixed(2)}
                  />
                  <Info
                    label="Engine hours"
                    value={`${record.engineHours || 0} hrs`}
                  />
                </div>

                {record.notes && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {record.notes}
                    </p>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    to="/fuel/add"
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
            ))}
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