"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { PublicShare, SharedSubscription } from "@/types/share";
import {
  DollarSign, TrendingUp, Calendar, AlertTriangle,
  ExternalLink, RefreshCw,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  subscribed: { label: "Active",    color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
  paused:     { label: "Paused",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cancelled:  { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
};

function relDays(ts: { toDate?: () => Date; seconds?: number } | null | undefined): string {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
  const days = Math.ceil((date.getTime() / 1000 - Date.now() / 1000) / 86400);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days}d`;
}

function fmtDate(ts: { toDate?: () => Date; seconds?: number } | null | undefined): string {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(ts: { toDate?: () => Date; seconds?: number } | null | undefined): string {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function currencySymbol(c: string) {
  return c === "GHS" ? "₵" : c === "EUR" ? "€" : c === "GBP" ? "£" : "$";
}

const cardIn = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ── page ──────────────────────────────────────────────────────────────────────
export default function SharePage() {
  const { token }  = useParams<{ token: string }>();
  const [data, setData]       = useState<PublicShare | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    const unsub = onSnapshot(doc(db, "publicShares", token), (snap) => {
      if (snap.exists()) {
        setData({ token, ...snap.data() } as PublicShare);
      } else {
        setNotFound(true);
      }
    });
    return unsub;
  }, [token]);

  // ── loading ──
  if (!data && !notFound) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#070a14", color: "rgba(255,255,255,0.92)",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#7c6ef7",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── not found ──
  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14,
        background: "#070a14", color: "rgba(255,255,255,0.92)",
        fontFamily: "system-ui, sans-serif",
      }}>
        <AlertTriangle size={36} color="#f59e0b" />
        <div style={{ fontSize: 18, fontWeight: 700 }}>Link not found</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          This share link has expired or been removed.
        </div>
      </div>
    );
  }

  const subs       = data!.subscriptions ?? [];
  const active     = subs.filter((s) => s.status === "subscribed");
  const paused     = subs.filter((s) => s.status === "paused");
  const cancelled  = subs.filter((s) => s.status === "cancelled");
  const monthly    = active.reduce((a, s) => a + s.amount, 0);
  const annual     = monthly * 12;
  const pausedAmt  = paused.reduce((a, s) => a + s.amount, 0);

  const today = Date.now() / 1000;
  const upcoming = [...subs]
    .filter((s) => s.status !== "cancelled" && s.nextDueDate)
    .sort((a, b) => {
      const at = a.nextDueDate as { seconds?: number } | null;
      const bt = b.nextDueDate as { seconds?: number } | null;
      return (at?.seconds ?? 0) - (bt?.seconds ?? 0);
    });

  const dueWeek = upcoming.filter((s) => {
    const ts = s.nextDueDate as { seconds?: number } | null;
    return ts && (ts.seconds! - today) / 86400 <= 7;
  }).length;

  const top3 = [...active].sort((a, b) => b.amount - a.amount).slice(0, 3);

  const groupColor = data!.groupColor;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070a14",
      backgroundImage: `
        radial-gradient(ellipse 55% 50% at 10% 0%, ${groupColor}18 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 90% 80%, rgba(79,172,254,0.06) 0%, transparent 70%)
      `,
      color: "rgba(255,255,255,0.92)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "0 0 60px",
    }}>

      {/* Header banner */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: groupColor + "20", border: `1px solid ${groupColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: groupColor }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>{data!.groupName}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
              Shared by {data!.ownerName} · Updated {timeAgo(data!.updatedAt)}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5,
        }}>
          <ExternalLink size={10} />Read-only snapshot
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 24px 0", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* KPI row */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
        >
          {[
            { label: "Monthly Spend",    value: `$${monthly.toFixed(2)}`,   sub: `${active.length} active`,             Icon: DollarSign, accent: "#7c6ef7" },
            { label: "Annual Projected", value: `$${annual.toFixed(0)}`,    sub: "At current rate",                      Icon: TrendingUp, accent: "#60a5fa" },
            { label: "Due This Week",    value: dueWeek,                    sub: "upcoming renewals",                    Icon: Calendar,   accent: dueWeek > 0 ? "#f59e0b" : "#60a5fa" },
            { label: "Potential Savings",value: `$${pausedAmt.toFixed(2)}/mo`, sub: `${paused.length} paused`,          Icon: RefreshCw,  accent: "#22c55e" },
          ].map((kpi) => (
            <motion.div key={kpi.label} variants={cardIn} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "16px 18px",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: kpi.accent + "1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}>
                <kpi.Icon size={15} color={kpi.accent} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 5 }}>{kpi.label}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{kpi.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Savings alert */}
        {pausedAmt > 0 && (
          <motion.div variants={cardIn} initial="hidden" animate="show" style={{
            background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12, padding: "13px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <div style={{ fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: "#f59e0b" }}>${pausedAmt.toFixed(2)}/mo</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}> could be saved by cancelling {paused.length} paused service{paused.length !== 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        )}

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}>

          {/* Subscription list */}
          <motion.div variants={cardIn} initial="hidden" animate="show" style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: 22,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Subscriptions</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
              {subs.length} service{subs.length !== 1 ? "s" : ""} · sorted by next renewal
            </div>

            {upcoming.length === 0 && cancelled.length === subs.length ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
                All subscriptions cancelled
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[...upcoming, ...cancelled].map((sub, i) => {
                  const meta   = STATUS_META[sub.status] ?? STATUS_META.cancelled;
                  const ts     = sub.nextDueDate as { seconds?: number } | null;
                  const days   = ts ? Math.ceil((ts.seconds! - today) / 86400) : null;
                  const urgent = days !== null && days <= 7 && sub.status !== "cancelled";
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: i * 0.04, ease: "easeOut" }}
                      style={{
                        display: "flex", alignItems: "center", gap: 13,
                        padding: "13px 0",
                        borderBottom: i < subs.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      }}
                    >
                      {/* Logo / initials */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: groupColor + "20", overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, color: groupColor,
                      }}>
                        {sub.logoUrl
                          ? <img src={sub.logoUrl} alt={sub.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : sub.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                          {sub.description || sub.renewalPeriod}
                        </div>
                      </div>

                      {/* Due date */}
                      {sub.nextDueDate && sub.status !== "cancelled" && (
                        <div style={{
                          fontSize: 11.5, fontWeight: urgent ? 600 : 400,
                          color: urgent ? "#f59e0b" : "rgba(255,255,255,0.35)",
                          flexShrink: 0, textAlign: "right", marginRight: 6,
                        }}>
                          {fmtDate(sub.nextDueDate)}
                          <div style={{ fontSize: 10.5, marginTop: 1 }}>{relDays(sub.nextDueDate)}</div>
                        </div>
                      )}

                      {/* Status badge */}
                      <div style={{
                        fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                        background: meta.bg, color: meta.color, flexShrink: 0,
                      }}>{meta.label}</div>

                      {/* Amount */}
                      <div style={{ fontSize: 15, fontWeight: 800, minWidth: 62, textAlign: "right", flexShrink: 0 }}>
                        {currencySymbol(sub.currency)}{sub.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status donut */}
            <motion.div variants={cardIn} initial="hidden" animate="show" style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: 20,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Status Overview</div>
              {subs.length > 0 && (() => {
                const total  = subs.length;
                const ap     = (active.length / total) * 100;
                const pp     = (paused.length / total) * 100;
                const donut  = `conic-gradient(#22c55e 0% ${ap}%, #f59e0b ${ap}% ${ap+pp}%, #ef4444 ${ap+pp}% 100%)`;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                      <div style={{ width: 80, height: 80, borderRadius: "50%", background: donut }} />
                      <div style={{
                        position: "absolute", inset: 13, borderRadius: "50%",
                        background: "#0c1020",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 800,
                      }}>{total}</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "Active",    count: active.length,    color: "#22c55e" },
                        { label: "Paused",    count: paused.length,    color: "#f59e0b" },
                        { label: "Cancelled", count: cancelled.length, color: "#ef4444" },
                      ].map((row) => (
                        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: row.color }} />
                          <span style={{ fontSize: 12, flex: 1 }}>{row.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>

            {/* Top 3 expenses */}
            {top3.length > 0 && (
              <motion.div variants={cardIn} initial="hidden" animate="show" style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Top Expenses</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {top3.map((sub, i) => {
                    const pct   = monthly > 0 ? (sub.amount / monthly) * 100 : 0;
                    const COLORS = ["#ef4444", "#f97316", "#f59e0b"];
                    return (
                      <div key={sub.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{sub.name}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700 }}>${sub.amount.toFixed(2)}</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                            style={{ height: "100%", borderRadius: 100, background: COLORS[i] ?? groupColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Upcoming this month */}
            {upcoming.slice(0, 4).length > 0 && (
              <motion.div variants={cardIn} initial="hidden" animate="show" style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: 20,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Next Renewals</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcoming.slice(0, 4).map((sub) => {
                    const ts   = sub.nextDueDate as { seconds?: number } | null;
                    const days = ts ? Math.ceil((ts.seconds! - today) / 86400) : null;
                    const urg  = days !== null && days <= 7;
                    return (
                      <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{sub.name}</span>
                        <span style={{
                          fontSize: 11.5, fontWeight: urg ? 700 : 400,
                          color: urg ? "#f59e0b" : "rgba(255,255,255,0.35)",
                        }}>{relDays(sub.nextDueDate)}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: 12 }}>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>
            This is a read-only snapshot · Data may not reflect real-time changes
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
            Powered by <span style={{ color: "#7c6ef7" }}>SubTrack</span>
          </div>
        </div>
      </div>
    </div>
  );
}
