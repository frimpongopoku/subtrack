"use client";

import { createContext, useContext, useState } from "react";

interface ModalContextValue {
  addOpen: boolean;
  openAdd: () => void;
  closeAdd: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  addOpen: false,
  openAdd: () => {},
  closeAdd: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ addOpen, openAdd: () => setAddOpen(true), closeAdd: () => setAddOpen(false) }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
