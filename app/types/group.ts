import { Timestamp } from "firebase/firestore";

export interface Group {
  id:        string;
  name:      string;
  color:     string;
  createdAt: Timestamp;
}

export type GroupInput = Pick<Group, "name" | "color">;
