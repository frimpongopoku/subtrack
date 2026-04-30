import {
  doc, setDoc, deleteDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { Group } from "@/types/group";
import { Subscription } from "@/types/subscription";

function shareDoc(token: string) {
  return doc(db, "publicShares", token);
}

function groupDoc(uid: string, groupId: string) {
  return doc(db, "users", uid, "groups", groupId);
}

function buildPayload(group: Group, subs: Subscription[], ownerName: string) {
  return {
    ownerName,
    groupId:    group.id,
    groupName:  group.name,
    groupColor: group.color,
    subscriptions: subs.map((s) => ({
      id:            s.id,
      name:          s.name,
      description:   s.description,
      amount:        s.amount,
      currency:      s.currency,
      status:        s.status,
      renewalPeriod: s.renewalPeriod,
      nextDueDate:   s.nextDueDate ?? null,
      logoUrl:       s.logoUrl ?? null,
    })),
    updatedAt: serverTimestamp(),
  };
}

export async function generateShare(
  uid: string,
  group: Group,
  subs: Subscription[],
  ownerName: string,
): Promise<string> {
  const token = group.shareToken ?? crypto.randomUUID();
  // Write public doc first — if this fails the group stays unchanged (no orphan)
  await setDoc(shareDoc(token), buildPayload(group, subs, ownerName));
  // Only stamp the group once we know the public doc exists
  if (!group.shareToken) {
    await updateDoc(groupDoc(uid, group.id), { shareToken: token });
  }
  return token;
}

export async function updateShare(
  group: Group,
  subs: Subscription[],
  ownerName: string,
): Promise<void> {
  if (!group.shareToken) return;
  await setDoc(shareDoc(group.shareToken), buildPayload(group, subs, ownerName));
}

export async function stopSharing(uid: string, group: Group): Promise<void> {
  if (!group.shareToken) return;
  await Promise.all([
    deleteDoc(shareDoc(group.shareToken)),
    updateDoc(groupDoc(uid, group.id), { shareToken: null }),
  ]);
}
