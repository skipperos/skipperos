import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type MaintenanceInput = {
  boatId: string;
  boatName: string;
  title: string;
  taskType: string;
  priority: string;
  dueDate: string;
  dueEngineHours: number;
  currentEngineHours: number;
  status: string;
  notes: string;
};

export type MaintenanceTask = MaintenanceInput & {
  id: string;
  ownerId: string;
  createdAt?: unknown;
};

export async function createMaintenanceTask(
  ownerId: string,
  taskData: MaintenanceInput
) {
  const docRef = await addDoc(collection(db, "maintenance"), {
    ownerId,
    ...taskData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getMaintenanceTasksForUser(
  ownerId: string
): Promise<MaintenanceTask[]> {
  const maintenanceQuery = query(
    collection(db, "maintenance"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(maintenanceQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<MaintenanceTask, "id">),
  }));
}

export function getMaintenanceDueStatus(task: MaintenanceTask) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (task.status === "Completed") return "completed";

  let dateStatus = "not_due";

  if (task.dueDate) {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) dateStatus = "overdue";
    else if (daysUntilDue <= 14) dateStatus = "due_soon";
  }

  const engineStatus =
    task.dueEngineHours > 0 &&
      task.currentEngineHours > 0 &&
      task.currentEngineHours >= task.dueEngineHours
      ? "overdue"
      : "not_due";

  if (dateStatus === "overdue" || engineStatus === "overdue") return "overdue";
  if (dateStatus === "due_soon") return "due_soon";

  return "not_due";
}

export function getDaysUntilDue(dueDate: string) {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}