import { useEffect, useState } from "react";
import { Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";
import { createFuelRecord } from "../services/fuelService";
import { getCurrentUserSafe } from "../services/authUser";

export default function AddFuel() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [boatId, setBoatId] = useState("");

  const [fuelDate, setFuelDate] = useState("");
  const [fuelType, setFuelType] = useState("Diesel");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [engineHours, setEngineHours] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [error, setError] = useState("");

  const totalCost =
    Number(quantity || 0) > 0 && Number(pricePerUnit || 0) > 0
      ? Number(quantity || 0) * Number(pricePerUnit || 0)
      : 0;

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

  async function handleCreateFuelRecord(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const selectedBoat = boats.find((boat) => boat.id === boatId);

    if (!selectedBoat) {
      setError("Please select a boat before saving the fuel record.");
      return;
    }

    setLoading(true);

    try {
      await createFuelRecord(user.uid, {
        boatId,
        boatName: selectedBoat.boatName,
        fuelDate,
        fuelType,
        quantity: Number(quantity || 0),
        pricePerUnit: Number(pricePerUnit || 0),
        totalCost,
        engineHours: Number(engineHours || 0),
        notes,
      });

      navigate("/fuel");
    } catch (err: any) {
      setError(err.message || "Could not save fuel record.");
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
              <p className="text-xl font-black text-slate-900">Add fuel record</p>
              <p className="text-xs text-slate-500">
                Track fuel usage, cost, and engine hours
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/fuel")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Fuel details</h1>

          <p className="mt-2 text-slate-600">
            Record fuel purchases and usage for each vessel.
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
                Add a boat before creating fuel records.
              </p>
              <button
                onClick={() => navigate("/boats/add")}
                className="mt-5 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white"
              >
                Add boat
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateFuelRecord} className="mt-8 grid gap-5">
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
                <label className="text-sm font-bold text-slate-700">Fuel date</label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Fuel type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  <option>Diesel</option>
                  <option>Petrol/Gasoline</option>
                  <option>Marine diesel</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Price per unit
                  </label>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="22.50"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Engine hours
                  </label>
                  <input
                    type="number"
                    value={engineHours}
                    onChange={(e) => setEngineHours(e.target.value)}
                    min="0"
                    step="0.1"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-ocean-50 p-5">
                <p className="text-sm font-bold text-ocean-700">Total cost</p>
                <p className="mt-1 text-3xl font-black text-ocean-900">
                  {totalCost.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="Fuel supplier, harbour, receipt number, unusual consumption, etc."
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving fuel record..." : "Save fuel record"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}