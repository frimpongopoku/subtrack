"use client";

import { useState } from "react";
import { CreditCard, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";
import { Subscription, SubscriptionStatus } from "@/types/subscription";
import { renewSubscription, changeStatus, deleteSubscription } from "@/services/subscriptions";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { useSearch } from "@/contexts/SearchContext";

type StatusFilter = "all" | SubscriptionStatus;
type GroupFilter  = "all" | string;
type SortKey      = "dueDate" | "amount" | "name" | "recent";

const SEG: React.CSSProperties = {
  padding: "6px 13px", borderRadius: 7,
  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  border: "none", fontFamily: "inherit", color: "var(--text2)",
  background: "transparent", transition: "all 0.14s", whiteSpace: "nowrap",
};

export default function SubscriptionsPage() {
  const { user }                          = useAuth();
  const { subscriptions, loading, error } = useSubscriptions(user?.uid);
  const { groups }                        = useGroupsContext();
  const { query }                         = useSearch();
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("all");
  const [groupFilter,  setGroupFilter]    = useState<GroupFilter>("all");
  const [sortKey,      setSortKey]        = useState<SortKey>("dueDate");
  const [modal, setModal]                 = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]             = useState<Subscription | null>(null);

  // ── Filters + Search + Sort ───────────────────────────────────────────────
  const q = query.trim().toLowerCase();

  const shown = subscriptions
    .filter((s) => statusFilter === "all" || s.status === statusFilter)
    .filter((s) => groupFilter  === "all" || s.groupId === groupFilter)
    .filter((s) => {
      if (!q) return true;
      const group = groups.find((g) => g.id === s.groupId);
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        (group?.name.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "dueDate":
          return (a.nextDueDate?.toDate().getTime() ?? 0) - (b.nextDueDate?.toDate().getTime() ?? 0);
        case "amount":
          return b.amount - a.amount;
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0);
      }
    });

  const counts = {
    all:        subscriptions.length,
    subscribed: subscriptions.filter((s) => s.status === "subscribed").length,
    paused:     subscriptions.filter((s) => s.status === "paused").length,
    cancelled:  subscriptions.filter((s) => s.status === "cancelled").length,
  };

  const monthlyTotal = shown
    .filter((s) => s.status === "subscribed")
    .reduce((a, s) => a + s.amount, 0);

  // ── Actions ───────────────────────────────────────────────────────────────
  function openEdit(sub: Subscription) {
    setEditing(sub);
    setModal("edit");
  }

  async function handleRenew(sub: Subscription) {
    if (!user) return;
    await renewSubscription(user.uid, sub.id, sub.renewalPeriod, sub.nextDueDate, sub.name);
  }

  async function handleStatus(sub: Subscription, status: "subscribed" | "paused" | "cancelled") {
    if (!user) return;
    await changeStatus(user.uid, sub.id, status, sub.name, sub.status);
  }

  async function handleDelete(sub: Subscription) {
    if (!user) return;
    if (confirm(`Delete "${sub.name}"? This cannot be undone.`)) {
      await deleteSubscription(user.uid, sub.id);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid var(--border2)", borderTopColor: "var(--accent)",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "20px 24px", borderRadius: 12, margin: "40px auto", maxWidth: 480,
        background: "var(--redbg)", border: "1px solid rgba(239,68,68,0.25)",
        color: "var(--red)", fontSize: 13, lineHeight: 1.6,
      }}>
        <strong>Firestore error:</strong> {error}
        <br /><br />
        Make sure your Firestore security rules allow authenticated users to read/write their own data.
        In the Firebase console → Firestore → Rules, set:
        <pre style={{ marginTop: 10, fontSize: 11, background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8, overflowX: "auto" }}>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}`}</pre>
      </div>
    );
  }

  return (
    <div className="ani" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Status filter tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2,
        }}>
          {(["all", "subscribed", "paused", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                ...SEG,
                background: statusFilter === f ? "rgba(124,110,247,0.2)" : "transparent",
                color:      statusFilter === f ? "var(--accent)" : "var(--text2)",
              }}
            >
              {f === "all" ? "All" : f === "subscribed" ? "Active" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{
                marginLeft: 5, fontSize: 10,
                background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "1px 6px",
              }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Group filter */}
        <div style={{
          display: "flex", background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2,
          marginLeft: "auto",
        }}>
          <button
            onClick={() => setGroupFilter("all")}
            style={{ ...SEG, background: groupFilter === "all" ? "rgba(124,110,247,0.2)" : "transparent", color: groupFilter === "all" ? "var(--accent)" : "var(--text2)" }}
          >All Groups</button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupFilter(g.id)}
              style={{ ...SEG, background: groupFilter === g.id ? "rgba(124,110,247,0.2)" : "transparent", color: groupFilter === g.id ? "var(--accent)" : "var(--text2)" }}
            >{g.name}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <ArrowUpDown size={13} color="var(--text3)" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text2)", fontFamily: "inherit",
              fontSize: 12.5, fontWeight: 600, padding: "5px 10px",
              outline: "none", cursor: "pointer", appearance: "none",
            }}
          >
            <option value="dueDate">Due Date</option>
            <option value="amount">Amount</option>
            <option value="name">Name A–Z</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { label: "Total monthly",  value: `$${monthlyTotal.toFixed(2)}`,           color: "var(--accent)" },
          { label: "Showing",        value: `${shown.length} subscriptions`,         color: "var(--text2)"  },
          { label: "Annual cost",    value: `$${(monthlyTotal * 12).toFixed(0)}/yr`, color: "var(--blue)"   },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "9px 16px", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, display: "flex", gap: 8, alignItems: "center",
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11.5, color: "var(--text3)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid or empty state */}
      {shown.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {shown.map((s, i) => (
            <SubscriptionCard
              key={s.id}
              sub={s}
              groups={groups}
              index={i}
              onEdit={openEdit}
              onRenew={handleRenew}
              onStatus={handleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: "80px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <CreditCard size={40} color="var(--text3)" />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>
            {subscriptions.length === 0 ? "No subscriptions yet" : "No subscriptions match your filters"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>
            {subscriptions.length === 0
              ? `Click "Add New" in the top bar to get started`
              : "Try adjusting your filters"}
          </div>
        </div>
      )}

      {/* Modals */}
      {modal === "add" && <SubscriptionFormModal onClose={() => setModal(null)} />}
      {modal === "edit" && editing && (
        <SubscriptionFormModal
          subscription={editing}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}
    </div>
  );
}
