import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function signupUser({
  companyName,
  email,
  password,
}: {
  companyName: string;
  email: string;
  password: string;
}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(userCredential.user, {
    displayName: companyName,
  });

  const trialStartedAt = new Date();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    companyName,
    email,
    plan: "trial",
    planStatus: "trialing",
    trialStartedAt: Timestamp.fromDate(trialStartedAt),
    trialEndsAt: Timestamp.fromDate(trialEndsAt),
    role: "owner",
    createdAt: serverTimestamp(),
  });

  return userCredential.user;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}