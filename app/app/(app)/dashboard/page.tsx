"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign, TrendingUp, CreditCard, Calendar,
  AlertTriangle, ChevronRight, RefreshCw, Pause, Play, X, Plus, Edit2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { logoColor, logoInitials } from "@/lib/logoUtils";
import { LogType } from "@/types/log";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (ts: { toDate: () => Date } | null | undefined) =>
  ts?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? "—";

function relDays(ts: { toDate: () => Date } | null | undefined): string {
  if (!ts) return "—";
  const days = Math.ceil((ts.toDate().getTime() / 1000 - Date.now() / 1000) / 86400);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days}d`;
}

const LOG_META: Record<LogType, { label: string; color: string; Icon: React.ElementType }> = {
  created:   { label: "Added",     color: "var(--accent)",  Icon: Plus      },
  renewed:   { label: "Renewed",   color: "var(--green)",   Icon: RefreshCw },
  paused:    { label: "Paused",    color: "var(--amber)",   Icon: Pause     },
  resumed:   { label: "Resumed",   color: "var(--green)",   Icon: Play      },
  cancelled: { label: "Cancelled", color: "var(--red)",     Icon: X         },
  edited:    { label: "Edited",    color: "var(--blue)",    Icon: Edit2     },
};

function fmtLogTime(ts: { toDate: () => Date } | undefined): string {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── sub-components ────────────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function StatCard({
  label, value, sub, Icon, accent, change,
}: {
  label: string; value: string | number; sub?: string;
  Icon: React.ElementType; accent: string; change?: number;
}) {
  return (
    <motion.div
      variants={cardVariant}
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "18px 20px",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: accent + "1a",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={17} color={accent} />
        </div>
        {change !== undefined && (
          <div style={{
            fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 100,
            background: change > 0 ? "var(--redbg)"   : "var(--greenbg)",
            color:      change > 0 ? "var(--red)"     : "var(--green)",
          }}>
            {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.6px", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 5 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }          = useAuth();
  const { subscriptions } = useSubscriptions(user?.uid);
  const { groups }        = useGroupsContext();
  const { logs }          = useActivityLogs(user?.uid);

  const active    = subscriptions.filter((s) => s.status === "subscribed");
  const paused    = subscriptions.filter((s) => s.status === "paused");
  const cancelled = subscriptions.filter((s) => s.status === "cancelled");

  const monthly       = active.reduce((a, s) => a + s.amount, 0);
  const annual        = monthly * 12;
  const pausedSavings = paused.reduce((a, s) => a + s.amount, 0);

  const today   = Date.now() / 1000;
  const dueWeek = subscriptions.filter(
    (s) => s.status !== "cancelled" && s.nextDueDate &&
      (s.nextDueDate.toDate().getTime() / 1000 - today) / 86400 <= 7
  ).length;

  const upcoming = [...subscriptions]
    .filter((s) => s.status !== "cancelled" && s.nextDueDate)
    .sort((a, b) =>
      (a.nextDueDate?.toDate().getTime() ?? 0) - (b.nextDueDate?.toDate().getTime() ?? 0)
    ).slice(0, 7);

  // Donut
  const total = subscriptions.length || 1;
  const ap    = (active.length / total) * 100;
  const pp    = (paused.length / total) * 100;
  const donut = `conic-gradient(#22c55e 0% ${ap}%, #f59e0b ${ap}% ${ap + pp}%, #ef4444 ${ap + pp}% 100%)`;

  // Spend by group
  const groupTotals = groups.map((g) => ({
    ...g,
    total: active.filter((s) => s.groupId === g.id).reduce((a, s) => a + s.amount, 0),
  })).filter((g) => g.total > 0).sort((a, b) => b.total - a.total);
  const maxGroup = Math.max(...groupTotals.map((g) => g.total), 1);

  // Recent logs
  const recentLogs = logs.slice(0, 3);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: "flex", flexDirection: "column", gap: 22 }}
    >
      {/* KPI row */}
      <motion.div
        variants={container}
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
      >
        <StatCard
          label="Monthly Spend" value={`$${monthly.toFixed(2)}`}
          sub={`${active.length} active service${active.length !== 1 ? "s" : ""}`}
          Icon={DollarSign} accent="var(--accent)"
        />
        <StatCard
          label="Annual Projected" value={`$${annual.toFixed(0)}`}
          sub="At current rate"
          Icon={TrendingUp} accent="var(--blue)"
        />
        <StatCard
          label="Active Services" value={active.length}
          sub={`${paused.length} paused`}
          Icon={CreditCard} accent="var(--green)"
        />
        <StatCard
          label="Due This Week" value={dueWeek}
          sub="Needs attention"
          Icon={Calendar} accent={dueWeek > 2 ? "var(--amber)" : "var(--blue)"}
        />
      </motion.div>

      {/* Savings alert */}
      {pausedSavings > 0 && (
        <motion.div
          variants={cardVariant}
          style={{
            background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12, padding: "13px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <AlertTriangle size={18} color="var(--amber)" />
          <div style={{ flex: 1, fontSize: 13.5 }}>
            <span style={{ fontWeight: 700, color: "var(--amber)" }}>Save ${pausedSavings.toFixed(2)}/mo</span>
            <span style={{ color: "var(--text2)" }}> · {paused.length} paused subscription{paused.length !== 1 ? "s" : ""} still allocated</span>
          </div>
          <Link href="/insights" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 600, color: "var(--text2)",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "5px 11px", textDecoration: "none",
            transition: "all 0.15s",
          }} className="btn-sm">
            View Insights <ChevronRight size={11} />
          </Link>
        </motion.div>
      )}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>

        {/* Upcoming renewals */}
        <motion.div
          variants={cardVariant}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Renewals</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Sorted by nearest due date</div>
            </div>
            <Link href="/subscriptions" className="btn-sm" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600, color: "var(--text2)",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 11px", textDecoration: "none",
              transition: "all 0.15s",
            }}>
              View all <ChevronRight size={11} />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)", fontSize: 13 }}>
              No upcoming renewals
            </div>
          ) : (
            upcoming.map((sub, i) => {
              const lc      = logoColor(sub.name);
              const li      = logoInitials(sub.name);
              const dueTs   = sub.nextDueDate ? sub.nextDueDate.toDate().getTime() / 1000 : 0;
              const days    = Math.ceil((dueTs - today) / 86400);
              const urgent  = days <= 7;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24, delay: i * 0.04, ease: "easeOut" }}
                  style={{
                    display: "flex", alignItems: "center", gap: 13,
                    padding: "12px 0",
                    borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: lc + "20", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: lc,
                  }}>
                    {sub.logoUrl
                      ? <Image src={sub.logoUrl} alt={sub.name} width={38} height={38} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      : li}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{sub.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{sub.description || fmtDate(sub.nextDueDate)}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>${sub.amount.toFixed(2)}</div>
                    <div style={{
                      fontSize: 11, marginTop: 2,
                      fontWeight: urgent ? 600 : 400,
                      color: urgent ? "var(--amber)" : "var(--text3)",
                    }}>
                      {relDays(sub.nextDueDate)}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status donut */}
          <motion.div
            variants={cardVariant}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 20,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 18 }}>Status Overview</div>
            {subscriptions.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No subscriptions yet</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: donut }} />
                  <div style={{
                    position: "absolute", inset: 14, borderRadius: "50%", background: "var(--bg2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800,
                  }}>{subscriptions.length}</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  {[
                    { label: "Active",    count: active.length,    color: "#22c55e" },
                    { label: "Paused",    count: paused.length,    color: "#f59e0b" },
                    { label: "Cancelled", count: cancelled.length, color: "#ef4444" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, flex: 1 }}>{row.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 800 }}>{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Spend by group */}
          <motion.div
            variants={cardVariant}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 20,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 18 }}>Spend by Group</div>
            {groupTotals.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>No grouped subscriptions</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {groupTotals.map((g) => (
                  <div key={g.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{g.name}</span>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text2)" }}>${g.total.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(g.total / maxGroup) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        style={{ height: "100%", borderRadius: 100, background: g.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Recent activity */}
      <motion.div
        variants={cardVariant}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 22,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</div>
          <Link href="/activity" className="btn-sm" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 600, color: "var(--text2)",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "5px 11px", textDecoration: "none",
            transition: "all 0.15s",
          }}>
            View all <ChevronRight size={11} />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>
            No activity yet — actions like renewals and edits will appear here
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${recentLogs.length}, 1fr)` }}>
            {recentLogs.map((log, i) => {
              const meta = LOG_META[log.type] ?? LOG_META.edited;
              const Icon = meta.Icon;
              return (
                <div key={log.id} style={{
                  display: "flex", gap: 12, padding: "4px 18px",
                  borderRight: i < recentLogs.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: meta.color + "1a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={14} color={meta.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {log.subName}{" "}
                      <span style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                      {fmtLogTime(log.createdAt)} · {log.note}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
