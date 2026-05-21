import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export type TripInput = {
  boatId: string;
  boatName: string;
  tripType: string;
  departureTime: string;
  returnTime: string;
  crewCount: number;
  fuelStart: number;
  fuelEnd: number;
  notes: string;
};

export type Trip = TripInput & {
  id: string;
  ownerId: string;
  status: string;
  createdAt?: unknown;
};

export async function createTrip(ownerId: string, tripData: TripInput) {
  const docRef = await addDoc(collection(db, "trips"), {
    ownerId,
    ...tripData,
    status: "completed",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getTripsForUser(ownerId: string): Promise<Trip[]> {
  const tripsQuery = query(
    collection(db, "trips"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(tripsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Trip, "id">),
  }));
}