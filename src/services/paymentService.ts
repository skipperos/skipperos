import { Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type PlanKey = "starter" | "fleet" | "pro";

export type UserPlan = {
  uid?: string;
  email?: string;
  companyName?: string;
  plan?: "free" | "trial" | PlanKey;
  planStatus?: "free" | "trialing" | "active" | "past_due" | "cancelled";
  trialStartedAt?: Timestamp;
  trialEndsAt?: Timestamp;
  subscriptionCode?: string;
  customerCode?: string;
  lastPaymentReference?: string;
  paidAt?: unknown;
  updatedAt?: unknown;
};

export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserPlan;
}

export function isPaidUser(userPlan: UserPlan | null) {
  return userPlan?.planStatus === "active";
}

export function isTrialActive(userPlan: UserPlan | null) {
  if (userPlan?.planStatus !== "trialing") return false;
  if (!userPlan.trialEndsAt) return false;

  const trialEndDate = userPlan.trialEndsAt.toDate();
  return trialEndDate.getTime() > Date.now();
}

export function hasValidAccess(userPlan: UserPlan | null) {
  return isPaidUser(userPlan) || isTrialActive(userPlan);
}

export function getTrialDaysLeft(userPlan: UserPlan | null) {
  if (!userPlan?.trialEndsAt) return 0;

  const trialEndDate = userPlan.trialEndsAt.toDate();
  const diffMs = trialEndDate.getTime() - Date.now();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(daysLeft, 0);
}

export function getPlanLabel(plan?: string) {
  if (plan === "trial") return "14-day trial";
  if (plan === "starter") return "Starter";
  if (plan === "fleet") return "Fleet";
  if (plan === "pro") return "Operator Pro";

  return "Free";
}

export function getPlanStatusLabel(status?: string) {
  if (status === "trialing") return "Trial active";
  if (status === "active") return "Active";
  if (status === "past_due") return "Payment issue";
  if (status === "cancelled") return "Cancelled";

  return "Free";
}