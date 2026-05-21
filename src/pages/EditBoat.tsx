import { useEffect, useState } from "react";
import { ShipWheel } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteBoat,
  getBoatById,
  updateBoat,
} from "../services/boatService";

export default function EditBoat() {
  const navigate = useNavigate();
  const { boatId } = useParams();

  const [boatName, setBoatName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vesselType, setVesselType] = useState("Fishing boat");
  const [engineType, setEngineType] = useState("");
  const [engineHours, setEngineHours] = useState("");
  const [homePort, setHomePort] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoat() {
      if (!boatId) {
        navigate("/boats");
        return;
      }

      try {
        const boat = await getBoatById(boatId);

        if (!boat) {
          setError("Boat not found.");
          setLoading(false);
          return;
        }

        setBoatName(boat.boatName || "");
        setRegistrationNumber(boat.registrationNumber || "");
        setVesselType(boat.vesselType || "Fishing boat");
        setEngineType(boat.engineType || "");
        setEngineHours(String(boat.engineHours || ""));
        setHomePort(boat.homePort || "");
      } catch (err: any) {
        setError(err.message || "Could not load boat.");
      } finally {
        setLoading(false);
      }
    }

    loadBoat();
  }, [boatId, navigate]);

  async function handleUpdateBoat(e: React.FormEvent) {
    e.preventDefault();

    if (!boatId) return;

    setError("");
    setSaving(true);

    try {
      await updateBoat(boatId, {
        boatName,
        registrationNumber,
        vesselType,
        engineType,
        engineHours: Number(engineHours || 0),
        homePort,
      });

      navigate("/boats");
    } catch (err: any) {
      setError(err.message || "Could not update boat.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBoat() {
    if (!boatId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this boat? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setDeleting(true);

    try {
      await deleteBoat(boatId);
      navigate("/boats");
    } catch (err: any) {
      setError(err.message || "Could not delete boat.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-bold text-slate-900">Loading boat...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-bold text-ocean-700">Boats</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">
          Edit boat
        </h1>
        <p className="mt-2 text-slate-600">
          Update vessel details, engine hours, registration, and home port.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
            <ShipWheel size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">Boat details</h2>
            <p className="text-sm text-slate-600">
              Keep vessel records accurate.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateBoat} className="mt-8 grid gap-5">
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
            <label className="text-sm font-bold text-slate-700">
              Current engine hours
            </label>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              disabled={saving || deleting}
              type="submit"
              className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Save changes"}
            </button>

            <button
              disabled={saving || deleting}
              type="button"
              onClick={handleDeleteBoat}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete boat"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}