import { Timestamp } from "firebase/firestore";

export interface SharedSubscription {
  id:            string;
  name:          string;
  description:   string;
  amount:        number;
  currency:      string;
  status:        string;
  renewalPeriod: string;
  nextDueDate:   Timestamp | null;
  logoUrl:       string | null;
}

export interface PublicShare {
  token:         string;
  ownerName:     string;
  groupId:       string;
  groupName:     string;
  groupColor:    string;
  subscriptions: SharedSubscription[];
  updatedAt:     Timestamp;
}
