import { Timestamp } from "firebase/firestore";

export type SubscriptionStatus = "subscribed" | "paused" | "cancelled";
export type RenewalPeriod      = "weekly" | "monthly" | "quarterly" | "yearly";
export type Currency           = "USD" | "GHS" | "EUR" | "GBP";

export interface Subscription {
  id:            string;
  name:          string;
  description:   string;
  amount:        number;
  currency:      Currency;
  recurring:     boolean;
  renewalPeriod: RenewalPeriod;
  status:        SubscriptionStatus;
  groupId:       string | null;
  startDate:     Timestamp;
  nextDueDate:   Timestamp;
  logoUrl:       string | null;
  createdAt:     Timestamp;
  updatedAt:     Timestamp;
}

export type SubscriptionInput = Omit<Subscription, "id" | "createdAt" | "updatedAt" | "logoUrl">;
