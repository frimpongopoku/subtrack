"use client";

import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useGroups } from "@/hooks/useGroups";
import { Group } from "@/types/group";

interface GroupsContextValue {
  groups:  Group[];
  loading: boolean;
}

const GroupsContext = createContext<GroupsContextValue>({ groups: [], loading: true });

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { user }          = useAuth();
  const { groups, loading } = useGroups(user?.uid);

  return (
    <GroupsContext.Provider value={{ groups, loading }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroupsContext() {
  return useContext(GroupsContext);
}
