import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { GroupInput } from "@/types/group";

function groupsCol(uid: string) {
  return collection(db, "users", uid, "groups");
}

function groupDoc(uid: string, id: string) {
  return doc(db, "users", uid, "groups", id);
}

export async function createGroup(uid: string, data: GroupInput) {
  await addDoc(groupsCol(uid), { ...data, createdAt: serverTimestamp() });
}

export async function updateGroup(uid: string, id: string, data: Partial<GroupInput>) {
  await updateDoc(groupDoc(uid, id), data);
}

// Deletes the group and nullifies groupId on all its subscriptions
export async function deleteGroup(uid: string, id: string, subIds: string[]) {
  const batch = writeBatch(db);
  batch.delete(groupDoc(uid, id));
  for (const subId of subIds) {
    batch.update(doc(db, "users", uid, "subscriptions", subId), { groupId: null });
  }
  await batch.commit();
}
