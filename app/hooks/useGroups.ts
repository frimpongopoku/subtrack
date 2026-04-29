"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { Group } from "@/types/group";

export function useGroups(uid: string | undefined) {
  const [groups, setGroups]   = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(collection(db, "users", uid, "groups"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Group)));
        setLoading(false);
      },
      (err) => {
        console.error("Groups error:", err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [uid]);

  return { groups, loading };
}
