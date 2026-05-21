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

export type CrewInput = {
  fullName: string;
  role: string;
  phone: string;
  email: string;
  licenseName: string;
  licenseNumber: string;
  licenseExpiry: string;
  availability: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
};

export type CrewMember = CrewInput & {
  id: string;
  ownerId: string;
  status: string;
  createdAt?: unknown;
};

export async function createCrewMember(ownerId: string, crewData: CrewInput) {
  const docRef = await addDoc(collection(db, "crew"), {
    ownerId,
    ...crewData,
    status: getCrewLicenseStatus(crewData.licenseExpiry),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getCrewForUser(ownerId: string): Promise<CrewMember[]> {
  const crewQuery = query(
    collection(db, "crew"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(crewQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CrewMember, "id">),
  }));
}

export function getCrewLicenseStatus(expiryDate: string) {
  if (!expiryDate) return "no_expiry";

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 30) return "expiring_soon";

  return "valid";
}

export function getDaysUntilCrewLicenseExpiry(expiryDate: string) {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}