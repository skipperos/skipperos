import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor } from "lucide-react";
import { auth } from "../services/firebase";
import { createBoat } from "../services/boatService";

export default function AddBoat() {
  const navigate = useNavigate();

  const [boatName, setBoatName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vesselType, setVesselType] = useState("Fishing boat");
  const [engineType, setEngineType] = useState("");
  const [engineHours, setEngineHours] = useState("");
  const [homePort, setHomePort] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateBoat(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await createBoat(user.uid, {
        boatName,
        registrationNumber,
        vesselType,
        engineType,
        engineHours: Number(engineHours || 0),
        homePort,
      });

      navigate("/boats");
    } catch (err: any) {
      setError(err.message || "Could not create boat.");
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
              <p className="text-xl font-black text-slate-900">Add boat</p>
              <p className="text-xs text-slate-500">Create your first vessel profile</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Boat details</h1>
          <p className="mt-2 text-slate-600">
            Add the basic vessel information. We’ll expand this later with documents,
            photos, maintenance, and trip logs.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateBoat} className="mt-8 grid gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">Boat name</label>
              <input
                value={boatName}
                onChange={(e) => setBoatName(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Ocean Runner"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Registration number
              </label>
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Vessel registration number"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Vessel type</label>
              <select
                value={vesselType}
                onChange={(e) => setVesselType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              >
                <option>Fishing boat</option>
                <option>Charter boat</option>
                <option>Dive boat</option>
                <option>Tour boat</option>
                <option>Whale-watching boat</option>
                <option>Harbour transport</option>
                <option>Small cargo/coastal boat</option>
                <option>Workboat</option>
                <option>Crew boat</option>
                <option>Private marine service vessel</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Engine type</label>
              <input
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Yamaha 250HP / Volvo Penta / Diesel inboard"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Current engine hours</label>
              <input
                type="number"
                value={engineHours}
                onChange={(e) => setEngineHours(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="1200"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Home port</label>
              <input
                value={homePort}
                onChange={(e) => setHomePort(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Cape Town Harbour / Durban / Sydney / Auckland"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving boat..." : "Save boat"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}