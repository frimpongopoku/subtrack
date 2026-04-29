"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { ActivityLog } from "@/types/log";

export function useActivityLogs(uid: string | undefined) {
  const [logs,    setLogs]    = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const q = query(
      collection(db, "users", uid, "logs"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog)));
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [uid]);

  return { logs, loading };
}
