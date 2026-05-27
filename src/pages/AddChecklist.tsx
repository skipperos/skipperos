import { useEffect, useState } from "react";
import { ClipboardCheck, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUserSafe } from "../services/authUser";
import { getBoatsForUser } from "../services/boatService";
import type { Boat } from "../services/boatService";
import {
  checklistTemplates,
  createChecklist,
} from "../services/checklistService";
import type {
  ChecklistItem,
  ChecklistType,
} from "../services/checklistService";
import { checkUsageLimit } from "../services/planLimits";

const checklistTypes = Object.keys(checklistTemplates) as ChecklistType[];

export default function AddChecklist() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [boatId, setBoatId] = useState("");
  const [checklistType, setChecklistType] = useState<ChecklistType>(
    "Pre-trip safety checklist"
  );
  const [items, setItems] = useState<ChecklistItem[]>(
    checklistTemplates["Pre-trip safety checklist"].map((label) => ({
      label,
      checked: false,
    }))
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBoats() {
      const user = await getCurrentUserSafe();

      if (!user) return;

      const data = await getBoatsForUser(user.uid);
      setBoats(data);

      if (data.length > 0) {
        setBoatId(data[0].id);
      }
    }

    loadBoats();
  }, []);

  function handleTypeChange(type: ChecklistType) {
    setChecklistType(type);
    setItems(
      checklistTemplates[type].map((label) => ({
        label,
        checked: false,
      }))
    );
  }

  function toggleItem(index: number) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, checked: !item.checked } : item
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const user = await getCurrentUserSafe();

      if (!user) {
        throw new Error("You must be logged in to save a checklist.");
      }

      const limitCheck = await checkUsageLimit(user.uid, "checklists");

      if (!limitCheck.allowed) {
        setError(limitCheck.message);
        return;
      }

      const selectedBoat = boats.find((boat) => boat.id === boatId);

      if (!selectedBoat) {
        throw new Error("Please select a boat.");
      }

      await createChecklist(user.uid, {
        boatId: selectedBoat.id,
        boatName: selectedBoat.boatName,
        checklistType,
        items,
        notes,
      });

      navigate("/checklists");
    } catch (err: any) {
      setError(err.message || "Could not save checklist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ocean-700">Checklists</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Add checklist
          </h1>
          <p className="mt-2 text-slate-600">
            Create a practical checklist before or after a boat operation.
          </p>
        </div>

        <Link
          to="/checklists"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
          <ClipboardCheck size={24} />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-slate-700">Boat</label>
            <select
              value={boatId}
              onChange={(e) => setBoatId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
            >
              {boats.map((boat) => (
                <option key={boat.id} value={boat.id}>
                  {boat.boatName} — {boat.vesselType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              Checklist type
            </label>
            <select
              value={checklistType}
              onChange={(e) => handleTypeChange(e.target.value as ChecklistType)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
            >
              {checklistTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-black text-slate-900">Checklist items</h2>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={() => toggleItem(index)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left font-bold ${item.checked
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
              >
                <span>{item.label}</span>
                <span>{item.checked ? "✓ Done" : "Not checked"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="text-sm font-bold text-slate-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-ocean-700"
            placeholder="Add any extra notes, missing items, safety concerns or follow-ups..."
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save checklist"}
        </button>
      </div>
    </section>
  );
}