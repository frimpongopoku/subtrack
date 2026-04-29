"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { Subscription } from "@/types/subscription";

export function useSubscriptions(uid: string | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    // Timeout guard — if Firestore hasn't responded in 8s, surface an error
    const timeout = setTimeout(() => {
      setLoading(false);
      setError("Firestore did not respond. Make sure the Firestore database is created in your Firebase project and security rules are configured.");
    }, 8000);

    const q = query(
      collection(db, "users", uid, "subscriptions"),
      orderBy("nextDueDate", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        clearTimeout(timeout);
        setSubscriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(timeout);
        console.error("Firestore error:", err.code, err.message);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => { unsub(); clearTimeout(timeout); };
  }, [uid]);

  return { subscriptions, loading, error };
}
