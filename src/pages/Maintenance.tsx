import { useEffect, useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

import { getCurrentUserSafe } from "../services/authUser";

import {
  getDaysUntilDue,
  getMaintenanceDueStatus,
  getMaintenanceTasksForUser,
} from "../services/maintenanceService";
import type { MaintenanceTask } from "../services/maintenanceService";

export default function Maintenance() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaintenanceTasks() {
      const user = await getCurrentUserSafe();

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMaintenanceTasksForUser(user.uid);
        setTasks(data);
      } catch (error) {
        console.error("Maintenance load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMaintenanceTasks();
  }, []);

  const openTasks = tasks.filter((task) => task.status !== "Completed").length;
  const overdueTasks = tasks.filter(
    (task) => getMaintenanceDueStatus(task) === "overdue"
  ).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">Maintenance</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Maintenance tasks
          </h1>
          <p className="mt-2 text-slate-600">
            Track repairs, service intervals, inspections, engine-hour tasks,
            and critical follow-ups.
          </p>
        </div>

        <Link
          to="/maintenance/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 text-sm font-bold text-white hover:bg-ocean-900"
        >
          <Plus size={18} />
          Add task
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <SummaryCard title="Total tasks" value={String(tasks.length)} />
        <SummaryCard title="Open tasks" value={String(openTasks)} />
        <SummaryCard title="Overdue" value={String(overdueTasks)} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">Loading maintenance tasks...</p>
            <p className="mt-1 text-sm text-slate-500">
              Fetching service records and repair follow-ups.
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
              <Wrench size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No maintenance tasks yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Add your first maintenance task to track repairs, inspections,
              service intervals, and engine-hour reminders.
            </p>

            <Link
              to="/maintenance/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              <Plus size={18} />
              Add first task
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => {
              const dueStatus = getMaintenanceDueStatus(task);
              const daysUntilDue = getDaysUntilDue(task.dueDate);

              return (
                <div
                  key={task.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-50 text-ocean-700">
                    <Wrench size={25} />
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {task.title}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {task.boatName} • {task.taskType}
                  </p>

                  <div className="mt-5 space-y-3 text-sm">
                    <Info label="Priority" value={task.priority} />
                    <Info label="Status" value={task.status} />
                    <Info label="Due date" value={formatDate(task.dueDate)} />
                    <Info
                      label="Engine hours"
                      value={`${task.currentEngineHours || 0} / ${task.dueEngineHours || 0
                        } hrs`}
                    />
                  </div>

                  {task.notes && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Notes
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {task.notes}
                      </p>
                    </div>
                  )}

                  <div
                    className={`mt-6 rounded-xl px-4 py-3 text-sm font-bold ${getDueStatusClass(
                      dueStatus
                    )}`}
                  >
                    {getDueStatusText(dueStatus, daysUntilDue)}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      to="/maintenance/add"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add another
                    </Link>

                    <Link
                      to="/fuel/add"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add fuel
                    </Link>
                  </div>
                </div>
              );
            })}
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

function getDueStatusClass(status: string) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "overdue") return "bg-red-50 text-red-700";
  if (status === "due_soon") return "bg-amber-50 text-amber-700";

  return "bg-slate-50 text-slate-700";
}

function getDueStatusText(status: string, daysUntilDue: number | null) {
  if (status === "completed") return "Completed";
  if (status === "overdue") return "Overdue";
  if (status === "due_soon") return `Due soon: ${daysUntilDue} days left`;
  if (daysUntilDue === null) return "No due date";

  return `Not due: ${daysUntilDue} days left`;
}