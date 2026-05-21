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

export type FuelInput = {
  boatId: string;
  boatName: string;
  fuelDate: string;
  fuelType: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  engineHours: number;
  notes: string;
};

export type FuelRecord = FuelInput & {
  id: string;
  ownerId: string;
  createdAt?: unknown;
};

export async function createFuelRecord(ownerId: string, fuelData: FuelInput) {
  const docRef = await addDoc(collection(db, "fuelRecords"), {
    ownerId,
    ...fuelData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getFuelRecordsForUser(ownerId: string): Promise<FuelRecord[]> {
  const fuelQuery = query(
    collection(db, "fuelRecords"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(fuelQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FuelRecord, "id">),
  }));
}