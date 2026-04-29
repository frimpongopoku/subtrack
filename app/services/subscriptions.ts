import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { SubscriptionInput, RenewalPeriod } from "@/types/subscription";

function subsCol(uid: string) {
  return collection(db, "users", uid, "subscriptions");
}

function subDoc(uid: string, id: string) {
  return doc(db, "users", uid, "subscriptions", id);
}

export async function createSubscription(uid: string, data: SubscriptionInput): Promise<string> {
  const docRef = await addDoc(subsCol(uid), {
    ...data,
    logoUrl:   null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSubscription(uid: string, id: string, data: Partial<SubscriptionInput>) {
  await updateDoc(subDoc(uid, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteSubscription(uid: string, id: string) {
  await deleteDoc(subDoc(uid, id));
}

export async function renewSubscription(uid: string, id: string, period: RenewalPeriod, currentDue: Timestamp) {
  const next = new Date(currentDue.toDate());
  switch (period) {
    case "weekly":    next.setDate(next.getDate() + 7);           break;
    case "monthly":   next.setMonth(next.getMonth() + 1);         break;
    case "quarterly": next.setMonth(next.getMonth() + 3);         break;
    case "yearly":    next.setFullYear(next.getFullYear() + 1);   break;
  }
  await updateDoc(subDoc(uid, id), {
    nextDueDate: Timestamp.fromDate(next),
    status:      "subscribed",
    updatedAt:   serverTimestamp(),
  });
}

export async function changeStatus(uid: string, id: string, status: "subscribed" | "paused" | "cancelled") {
  await updateDoc(subDoc(uid, id), { status, updatedAt: serverTimestamp() });
}
