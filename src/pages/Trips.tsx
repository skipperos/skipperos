import { useEffect, useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { getTripsForUser } from "../services/tripService";
import type { Trip } from "../services/tripService";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTripsForUser(user.uid);
        setTrips(data);
      } catch (error) {
        console.error("Trips load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Trip logs</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Operational vessel records
          </h1>
          <p className="mt-2 text-slate-600">
            Track completed trips, crew count, fuel usage, operating notes, and vessel activity.
          </p>
        </div>

        <Link
          to="/trips/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add trip
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading trips...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching your operational trip logs.
            </p>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <ClipboardCheck size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No trip logs yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first trip log to start building operational history for your vessels.
            </p>

            <Link
              to="/trips/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                  <ClipboardCheck size={25} />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  {trip.boatName}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {trip.tripType}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <Info label="Departure" value={formatDateTime(trip.departureTime)} />
                  <Info label="Return" value={formatDateTime(trip.returnTime)} />
                  <Info label="Crew" value={`${trip.crewCount} people`} />
                  <Info
                    label="Fuel used"
                    value={`${trip.fuelStart}% → ${trip.fuelEnd}%`}
                  />
                </div>

                {trip.notes && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {trip.notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Status: Completed
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    to="/trips/add"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Add another
                  </Link>

                  <Link
                    to="/ai-report"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    AI report
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-bold text-slate-800">{value}</span>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "Not added";

  return new Date(value).toLocaleString();
}