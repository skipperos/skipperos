import { useEffect, useState } from "react";
import { Plus, ShipWheel } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";

export default function Boats() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoats() {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBoatsForUser(user.uid);
        setBoats(data);
      } catch (error) {
        console.error("Boats load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBoats();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Boats</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Vessel profiles
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your boats, registrations, engines, home ports, and operating status.
          </p>
        </div>

        <Link
          to="/boats/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add boat
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading boats...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching your vessel profiles.
            </p>
          </div>
        ) : boats.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <ShipWheel size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No boats added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first vessel to start tracking trips, crew, fuel, documents,
              maintenance, and reports.
            </p>

            <Link
              to="/boats/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first boat
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {boats.map((boat) => (
              <div
                key={boat.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                  <ShipWheel size={25} />
                </div>

                <h2 className="text-xl font-black text-slate-900">
                  {boat.boatName}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {boat.vesselType}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <Info label="Registration" value={boat.registrationNumber} />
                  <Info label="Home port" value={boat.homePort} />
                  <Info label="Engine" value={boat.engineType || "Not added"} />
                  <Info
                    label="Engine hours"
                    value={`${boat.engineHours || 0} hrs`}
                  />
                </div>

                <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Status: Active
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <Link
                    to={`/boats/edit/${boat.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>

                  <Link
                    to="/trips/add"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Trip
                  </Link>

                  <Link
                    to="/fuel/add"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Fuel
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