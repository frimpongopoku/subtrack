"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Plus, RefreshCw, Pause, Trash2, Edit2, Share2 } from "lucide-react";
import { ShareModal } from "./ShareModal";
import { Group } from "@/types/group";
import { Subscription } from "@/types/subscription";
import { StatusBadge } from "@/components/subscriptions/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { changeStatus, renewSubscription } from "@/services/subscriptions";
import { deleteGroup } from "@/services/groups";

interface Props {
  group:         Group;
  subscriptions: Subscription[];
  onEdit:        (group: Group) => void;
  onAddSub:      (groupId: string) => void;
  defaultOpen?:  boolean;
}

const BTN_SM: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 11px", borderRadius: 8,
  fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
  cursor: "pointer", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text2)",
  transition: "all 0.15s ease", whiteSpace: "nowrap",
};

export function GroupCard({ group, subscriptions, onEdit, onAddSub, defaultOpen = false }: Props) {
  const { user }           = useAuth();
  const [open, setOpen]    = useState(defaultOpen);
  const [sharing, setSharing] = useState(false);

  const active  = subscriptions.filter((s) => s.status === "subscribed");
  const monthly = active.reduce((a, s) => a + s.amount, 0);
  const pct     = subscriptions.length > 0 ? (active.length / subscriptions.length) * 100 : 0;

  const fmt = (ts: { toDate: () => Date } | null | undefined) =>
    ts?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? "—";

  async function handleRenewAll() {
    if (!user) return;
    await Promise.all(
      active.map((s) => renewSubscription(user.uid, s.id, s.renewalPeriod, s.nextDueDate, s.name))
    );
  }

  async function handlePauseAll() {
    if (!user) return;
    await Promise.all(
      active.map((s) => changeStatus(user.uid, s.id, "paused", s.name, s.status))
    );
  }

  async function handleDelete() {
    if (!user) return;
    if (!confirm(`Delete "${group.name}"? All subscriptions in this group will be unassigned.`)) return;
    await deleteGroup(user.uid, group.id, subscriptions.map((s) => s.id));
  }

  return (
    <motion.div
      layout
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: 14, overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px", cursor: "pointer" }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: group.color + "1a",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: group.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15.5 }}>{group.name}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
            {subscriptions.length} services · {active.length} active · {subscriptions.length - active.length} inactive
          </div>
        </div>

        <div style={{ textAlign: "right", marginRight: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>${monthly.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>per month</div>
        </div>

        <div style={{
          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
          background: group.color + "1a", color: group.color, flexShrink: 0,
        }}>${(monthly * 12).toFixed(0)}/yr</div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "var(--surface2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div style={{ margin: "0 22px 16px" }}>
        <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 100,
            width: `${pct}%`, background: group.color,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 22px 20px" }}>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />

              {subscriptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text3)", fontSize: 13 }}>
                  No subscriptions in this group yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...subscriptions].sort((a, b) =>
                    (a.nextDueDate?.toDate?.().getTime() ?? 0) - (b.nextDueDate?.toDate?.().getTime() ?? 0)
                  ).map((sub, i) => {
                    const dueTs  = sub.nextDueDate ? sub.nextDueDate.toDate().getTime() / 1000 : 0;
                    const days   = Math.ceil((dueTs - Date.now() / 1000) / 86400);
                    const urgent = days <= 7 && sub.status !== "cancelled";
                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}
                        style={{
                          display: "flex", alignItems: "center", gap: 13,
                          padding: "11px 14px", borderRadius: 11,
                          background: "var(--surface2)", border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: group.color + "20", overflow: "hidden",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 800, color: group.color,
                        }}>
                          {sub.logoUrl ? (
                            <Image src={sub.logoUrl} alt={sub.name} width={34} height={34}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                          ) : sub.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{sub.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{sub.description}</div>
                        </div>

                        <div style={{
                          fontSize: 11, fontWeight: urgent ? 600 : 400,
                          color: urgent ? "var(--amber)" : "var(--text3)",
                          marginRight: 8, flexShrink: 0,
                        }}>
                          Due {fmt(sub.nextDueDate)}
                        </div>

                        <StatusBadge status={sub.status} />

                        <div style={{ fontWeight: 800, fontSize: 15, minWidth: 60, textAlign: "right", flexShrink: 0 }}>
                          ${sub.amount.toFixed(2)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Group actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button className="btn-sm" style={BTN_SM} onClick={() => onAddSub(group.id)}>
                  <Plus size={12} />Add Subscription
                </button>
                {active.length > 0 && (
                  <button className="btn-sm" style={BTN_SM} onClick={handleRenewAll}>
                    <RefreshCw size={12} />Renew All
                  </button>
                )}
                {active.length > 0 && (
                  <button className="btn-sm" style={BTN_SM} onClick={handlePauseAll}>
                    <Pause size={12} />Pause All
                  </button>
                )}
                <button className="btn-sm" style={BTN_SM} onClick={() => onEdit(group)}>
                  <Edit2 size={12} />Edit Group
                </button>
                <button
                  className="btn-sm"
                  style={{
                    ...BTN_SM,
                    color: group.shareToken ? "var(--green)" : "var(--text2)",
                    borderColor: group.shareToken ? "rgba(34,197,94,0.3)" : "var(--border)",
                    background: group.shareToken ? "var(--greenbg)" : "var(--surface)",
                  }}
                  onClick={() => setSharing(true)}
                >
                  <Share2 size={12} />{group.shareToken ? "Shared" : "Share"}
                </button>
                <button
                  className="btn-danger"
                  style={{ ...BTN_SM, marginLeft: "auto", color: "var(--red)", background: "var(--redbg)", borderColor: "rgba(239,68,68,0.22)" }}
                  onClick={handleDelete}
                >
                  <Trash2 size={12} />Delete Group
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sharing && (
        <ShareModal
          group={group}
          subscriptions={subscriptions}
          onClose={() => setSharing(false)}
        />
      )}
    </motion.div>
  );
}
