import { useEffect, useState } from "react";
import { Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";
import { createTrip } from "../services/tripService";
import { getCurrentUserSafe } from "../services/authUser";

export default function AddTrip() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [boatId, setBoatId] = useState("");
  const [tripType, setTripType] = useState("Fishing trip");
  const [departureTime, setDepartureTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [crewCount, setCrewCount] = useState("");
  const [fuelStart, setFuelStart] = useState("");
  const [fuelEnd, setFuelEnd] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoats() {
      const user = await getCurrentUserSafe();

      if (!user) {
        navigate("/login");
        return;
      }

      const data = await getBoatsForUser(user.uid);
      setBoats(data);

      if (data.length > 0) {
        setBoatId(data[0].id);
      }

      setLoadingBoats(false);
    }

    loadBoats();
  }, [navigate]);

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const selectedBoat = boats.find((boat) => boat.id === boatId);

    if (!selectedBoat) {
      setError("Please select a boat before saving the trip.");
      return;
    }

    setLoading(true);

    try {
      await createTrip(user.uid, {
        boatId,
        boatName: selectedBoat.boatName,
        tripType,
        departureTime,
        returnTime,
        crewCount: Number(crewCount || 0),
        fuelStart: Number(fuelStart || 0),
        fuelEnd: Number(fuelEnd || 0),
        notes,
      });

      navigate("/trips");
    } catch (err: any) {
      setError(err.message || "Could not save trip.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-700 text-white">
              <Anchor size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">Add trip log</p>
              <p className="text-xs text-slate-500">Record vessel operation details</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/trips")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Trip details</h1>
          <p className="mt-2 text-slate-600">
            Create a clean operational record for a completed trip.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loadingBoats ? (
            <p className="mt-8 font-semibold text-slate-600">Loading boats...</p>
          ) : boats.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <h2 className="font-black text-slate-900">No boats available</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add a boat before creating trip logs.
              </p>
              <button
                onClick={() => navigate("/boats/add")}
                className="mt-5 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white"
              >
                Add boat
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTrip} className="mt-8 grid gap-5">
              <div>
                <label className="text-sm font-bold text-slate-700">Boat</label>
                <select
                  value={boatId}
                  onChange={(e) => setBoatId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  {boats.map((boat) => (
                    <option key={boat.id} value={boat.id}>
                      {boat.boatName} — {boat.vesselType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Trip type</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  <option>Fishing trip</option>
                  <option>Charter trip</option>
                  <option>Dive trip</option>
                  <option>Tour trip</option>
                  <option>Harbour transport</option>
                  <option>Cargo/coastal run</option>
                  <option>Maintenance run</option>
                  <option>Private service job</option>
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Departure time
                  </label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Return time
                  </label>
                  <input
                    type="datetime-local"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="text-sm font-bold text-slate-700">Crew count</label>
                  <input
                    type="number"
                    value={crewCount}
                    onChange={(e) => setCrewCount(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Fuel start %</label>
                  <input
                    type="number"
                    value={fuelStart}
                    onChange={(e) => setFuelStart(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Fuel end %</label>
                  <input
                    type="number"
                    value={fuelEnd}
                    onChange={(e) => setFuelEnd(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="52"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="Left harbour 05:30, 4 crew, weather calm, minor leak noticed near pump..."
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving trip..." : "Save trip log"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}