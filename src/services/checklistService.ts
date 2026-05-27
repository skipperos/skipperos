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

export type ChecklistType =
  | "Pre-trip safety checklist"
  | "Fishing gear checklist"
  | "Fuel & oil checklist"
  | "Crew readiness checklist"
  | "Document checklist"
  | "Post-trip checklist";

export type ChecklistItem = {
  label: string;
  checked: boolean;
};

export type ChecklistInput = {
  boatId: string;
  boatName: string;
  checklistType: ChecklistType;
  notes: string;
  items: ChecklistItem[];
};

export type Checklist = ChecklistInput & {
  id: string;
  ownerId: string;
  createdAt?: unknown;
};

export const checklistTemplates: Record<ChecklistType, string[]> = {
  "Pre-trip safety checklist": [
    "Life jackets checked",
    "First aid kit onboard",
    "Fire extinguisher checked",
    "Radio / communication checked",
    "Navigation lights checked",
    "Weather checked",
    "Emergency equipment onboard",
    "Crew briefed",
  ],
  "Fishing gear checklist": [
    "Rods and reels onboard",
    "Bait / lures packed",
    "Tackle box packed",
    "Cooler / ice ready",
    "Fishing permits checked",
    "Gaff / net onboard",
    "Knife and tools packed",
  ],
  "Fuel & oil checklist": [
    "Fuel level checked",
    "Spare fuel checked",
    "Oil level checked",
    "Engine warning lights checked",
    "Bilge checked",
    "Battery checked",
    "Engine start tested",
  ],
  "Crew readiness checklist": [
    "Crew confirmed",
    "Crew contact details checked",
    "Crew licenses checked if required",
    "Crew roles confirmed",
    "Crew safety briefing completed",
  ],
  "Document checklist": [
    "Vessel registration checked",
    "Safety certificate checked",
    "Insurance checked",
    "Skipper license checked",
    "Fishing / operating permits checked",
    "Passenger documents checked if required",
  ],
  "Post-trip checklist": [
    "Trip notes completed",
    "Fuel usage recorded",
    "Catch / client record completed",
    "Maintenance issues noted",
    "Boat cleaned",
    "Equipment stored",
    "Incident notes completed if needed",
  ],
};

export async function createChecklist(
  ownerId: string,
  checklistData: ChecklistInput
) {
  const docRef = await addDoc(collection(db, "checklists"), {
    ownerId,
    ...checklistData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getChecklistsForUser(
  ownerId: string
): Promise<Checklist[]> {
  const checklistsQuery = query(
    collection(db, "checklists"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(checklistsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Checklist, "id">),
  }));
}