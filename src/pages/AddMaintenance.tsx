import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";
import { createMaintenanceTask } from "../services/maintenanceService";
import { getCurrentUserSafe } from "../services/authUser";

export default function AddMaintenance() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [boatId, setBoatId] = useState("");

  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState("Engine service");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [dueEngineHours, setDueEngineHours] = useState("");
  const [currentEngineHours, setCurrentEngineHours] = useState("");
  const [status, setStatus] = useState("Open");
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

      try {
        const data = await getBoatsForUser(user.uid);
        setBoats(data);

        if (data.length > 0) {
          setBoatId(data[0].id);
          setCurrentEngineHours(String(data[0].engineHours || ""));
        }
      } catch (error) {
        console.error("Load boats error:", error);
      } finally {
        setLoadingBoats(false);
      }
    }

    loadBoats();
  }, [navigate]);

  function handleBoatChange(selectedBoatId: string) {
    setBoatId(selectedBoatId);

    const selectedBoat = boats.find((boat) => boat.id === selectedBoatId);

    if (selectedBoat) {
      setCurrentEngineHours(String(selectedBoat.engineHours || ""));
    }
  }

  async function handleCreateMaintenanceTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const selectedBoat = boats.find((boat) => boat.id === boatId);

    if (!selectedBoat) {
      setError("Please select a boat before saving the maintenance task.");
      return;
    }

    setLoading(true);

    try {
      await createMaintenanceTask(user.uid, {
        boatId,
        boatName: selectedBoat.boatName,
        title,
        taskType,
        priority,
        dueDate,
        dueEngineHours: Number(dueEngineHours || 0),
        currentEngineHours: Number(currentEngineHours || 0),
        status,
        notes,
      });

      navigate("/maintenance");
    } catch (err: any) {
      setError(err.message || "Could not save maintenance task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-bold text-ocean-700">Maintenance</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">
          Add maintenance task
        </h1>
        <p className="mt-2 text-slate-600">
          Track service work, repairs, inspections, and engine-hour based tasks.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
            <Wrench size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">Task details</h2>
            <p className="text-sm text-slate-600">
              Add the task, due date, priority, and engine-hour trigger.
            </p>
          </div>
        </div>

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
              Add a boat before creating maintenance tasks.
            </p>
            <button
              onClick={() => navigate("/boats/add")}
              className="mt-5 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white"
            >
              Add boat
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateMaintenanceTask} className="mt-8 grid gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">Boat</label>
              <select
                value={boatId}
                onChange={(e) => handleBoatChange(e.target.value)}
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
              <label className="text-sm font-bold text-slate-700">Task title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Replace fuel filter / inspect pump leak / oil service"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-700">Task type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  <option>Engine service</option>
                  <option>Oil change</option>
                  <option>Fuel system</option>
                  <option>Pump repair</option>
                  <option>Hull inspection</option>
                  <option>Battery replacement</option>
                  <option>Radio check</option>
                  <option>Safety equipment</option>
                  <option>Electrical</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-bold text-slate-700">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Current engine hours
                </label>
                <input
                  type="number"
                  value={currentEngineHours}
                  onChange={(e) => setCurrentEngineHours(e.target.value)}
                  min="0"
                  step="0.1"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Due engine hours
                </label>
                <input
                  type="number"
                  value={dueEngineHours}
                  onChange={(e) => setDueEngineHours(e.target.value)}
                  min="0"
                  step="0.1"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                  placeholder="1250"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
              >
                <option>Open</option>
                <option>In progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
                placeholder="Describe the issue, parts needed, mechanic notes, inspection results, or follow-up actions."
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving task..." : "Save maintenance task"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}