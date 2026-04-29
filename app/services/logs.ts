import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { LogType } from "@/types/log";

export interface LogInput {
  subName:         string;
  type:            LogType;
  note:            string;
  previousStatus?: string;
  newStatus?:      string;
}

export async function addLog(uid: string, subId: string, input: LogInput): Promise<void> {
  await addDoc(
    collection(db, "users", uid, "logs"),
    { ...input, subscriptionId: subId, createdAt: serverTimestamp() }
  );
}
