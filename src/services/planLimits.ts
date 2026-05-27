import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type PlanKey = "trial" | "starter" | "fleet" | "pro";

export type LimitResource =
  | "boats"
  | "trips"
  | "documents"
  | "fuelRecords"
  | "maintenance"
  | "crew"
  | "aiReports"
  | "checklists";

type PlanLimits = Record<LimitResource, number>;

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  trial: {
    boats: 1,
    trips: 5,
    documents: 5,
    fuelRecords: 5,
    maintenance: 5,
    crew: 2,
    aiReports: 3,
    checklists: 10,
  },
  starter: {
    boats: 2,
    trips: 50,
    documents: 50,
    fuelRecords: 50,
    maintenance: 50,
    crew: 5,
    aiReports: 20,
    checklists: 100,
  },
  fleet: {
    boats: 10,
    trips: 500,
    documents: 500,
    fuelRecords: 500,
    maintenance: 500,
    crew: 30,
    aiReports: 100,
    checklists: 1000,
  },
  pro: {
    boats: 999999,
    trips: 999999,
    documents: 999999,
    fuelRecords: 999999,
    maintenance: 999999,
    crew: 999999,
    aiReports: 999999,
    checklists: 999999,
  },
};

export function normalizePlan(plan?: string | null): PlanKey {
  if (plan === "starter" || plan === "fleet" || plan === "pro") {
    return plan;
  }

  return "trial";
}

export function getPlanDisplayName(plan: PlanKey) {
  if (plan === "starter") return "Starter";
  if (plan === "fleet") return "Fleet";
  if (plan === "pro") return "Operator Pro";

  return "Trial";
}

async function getUserPlanFromFirestore(ownerId: string) {
  const userRef = doc(db, "users", ownerId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return {
      plan: "trial",
      planStatus: "trialing",
    };
  }

  const data = snapshot.data();

  return {
    plan: data.plan || "trial",
    planStatus: data.planStatus || "trialing",
  };
}

export async function getUsageCount(
  ownerId: string,
  resource: LimitResource
): Promise<number> {
  const usageQuery = query(
    collection(db, resource),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(usageQuery);
  return snapshot.size;
}

export async function checkUsageLimit(
  ownerId: string,
  resource: LimitResource
) {
  const userPlan = await getUserPlanFromFirestore(ownerId);
  const plan = normalizePlan(userPlan.plan);
  const planStatus = userPlan.planStatus;

  const limit = PLAN_LIMITS[plan][resource];
  const currentUsage = await getUsageCount(ownerId, resource);

  const allowed = currentUsage < limit;

  return {
    allowed,
    plan,
    planStatus,
    planName: getPlanDisplayName(plan),
    limit,
    currentUsage,
    remaining: Math.max(limit - currentUsage, 0),
    message: allowed
      ? ""
      : `You have reached the ${getPlanDisplayName(
        plan
      )} plan limit for ${resource}. Upgrade your plan to add more.`,
  };
}