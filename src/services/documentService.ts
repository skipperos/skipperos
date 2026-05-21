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

export type DocumentInput = {
  boatId: string;
  boatName: string;
  documentType: string;
  documentName: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
};

export type VesselDocument = DocumentInput & {
  id: string;
  ownerId: string;
  status: string;
  createdAt?: unknown;
};

export async function createDocument(
  ownerId: string,
  documentData: DocumentInput
) {
  const docRef = await addDoc(collection(db, "documents"), {
    ownerId,
    ...documentData,
    status: getDocumentStatus(documentData.expiryDate),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getDocumentsForUser(
  ownerId: string
): Promise<VesselDocument[]> {
  const documentsQuery = query(
    collection(db, "documents"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(documentsQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<VesselDocument, "id">),
  }));
}

export function getDocumentStatus(expiryDate: string) {
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

export function getDaysUntilExpiry(expiryDate: string) {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}