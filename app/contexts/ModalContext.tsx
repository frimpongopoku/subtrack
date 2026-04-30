"use client";

import { createContext, useContext, useState } from "react";

interface ModalContextValue {
  addOpen: boolean;
  defaultGroupId: string | null;
  openAdd: (groupId?: string | null) => void;
  closeAdd: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  addOpen: false,
  defaultGroupId: null,
  openAdd: () => {},
  closeAdd: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const [defaultGroupId, setDefaultGroupId] = useState<string | null>(null);
  return (
    <ModalContext.Provider value={{
      addOpen,
      defaultGroupId,
      openAdd: (groupId = null) => { setDefaultGroupId(groupId ?? null); setAddOpen(true); },
      closeAdd: () => { setAddOpen(false); setDefaultGroupId(null); },
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
