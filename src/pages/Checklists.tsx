import { useEffect, useState } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentUserSafe } from "../services/authUser";
import { getChecklistsForUser } from "../services/checklistService";
import type { Checklist } from "../services/checklistService";

export default function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChecklists() {
      try {
        const user = await getCurrentUserSafe();

        if (!user) return;

        const data = await getChecklistsForUser(user.uid);
        setChecklists(data);
      } catch (error) {
        console.error("Checklists load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChecklists();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Checklists</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Operational checklists
          </h1>
          <p className="mt-2 text-slate-600">
            Keep pre-trip, gear, crew, document and post-trip checks organized.
          </p>
        </div>

        <Link
          to="/checklists/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add checklist
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-700">Loading checklists...</p>
          </div>
        ) : checklists.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <ClipboardCheck className="mx-auto text-ocean-700" size={36} />

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              No checklists yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first checklist for safety, fishing gear, fuel, crew,
              documents or post-trip follow-ups.
            </p>

            <Link
              to="/checklists/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first checklist
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {checklists.map((checklist) => {
              const completed = checklist.items.filter(
                (item) => item.checked
              ).length;
              const total = checklist.items.length;

              return (
                <div
                  key={checklist.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                    <ClipboardCheck size={24} />
                  </div>

                  <h2 className="mt-5 text-xl font-black text-slate-900">
                    {checklist.checklistType}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {checklist.boatName}
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      Completed
                    </p>
                    <p className="mt-1 text-3xl font-black text-slate-900">
                      {completed}/{total}
                    </p>
                  </div>

                  {checklist.notes && (
                    <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      {checklist.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}