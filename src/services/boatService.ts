import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type BoatInput = {
  boatName: string;
  registrationNumber: string;
  vesselType: string;
  engineType: string;
  engineHours: number;
  homePort: string;
};

export type Boat = BoatInput & {
  id: string;
  ownerId: string;
  status: string;
  createdAt?: unknown;
};

export async function createBoat(ownerId: string, boatData: BoatInput) {
  const docRef = await addDoc(collection(db, "boats"), {
    ownerId,
    ...boatData,
    status: "active",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getBoatsForUser(ownerId: string): Promise<Boat[]> {
  const boatsQuery = query(collection(db, "boats"), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(boatsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Boat, "id">),
  }));
}

export async function getBoatById(boatId: string): Promise<Boat | null> {
  const boatRef = doc(db, "boats", boatId);
  const snapshot = await getDoc(boatRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Boat, "id">),
  };
}

export async function updateBoat(boatId: string, boatData: BoatInput) {
  const boatRef = doc(db, "boats", boatId);

  await updateDoc(boatRef, {
    ...boatData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBoat(boatId: string) {
  const boatRef = doc(db, "boats", boatId);
  await deleteDoc(boatRef);
}