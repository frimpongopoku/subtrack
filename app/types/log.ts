import { Timestamp } from "firebase/firestore";

export type LogType = "created" | "renewed" | "paused" | "resumed" | "cancelled" | "edited";

export interface ActivityLog {
  id:             string;
  subscriptionId: string;
  subName:        string;
  type:           LogType;
  note:           string;
  previousStatus?: string;
  newStatus?:      string;
  createdAt:      Timestamp;
}
