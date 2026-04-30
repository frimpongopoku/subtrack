"use client";

import { useModal } from "@/contexts/ModalContext";
import { SubscriptionFormModal } from "./SubscriptionFormModal";

export function GlobalAddModal() {
  const { addOpen, closeAdd, defaultGroupId } = useModal();
  if (!addOpen) return null;
  return <SubscriptionFormModal onClose={closeAdd} defaultGroupId={defaultGroupId} />;
}
