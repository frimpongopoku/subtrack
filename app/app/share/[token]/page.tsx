"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { PublicShare } from "@/types/share";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  subscribed: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  paused: { label: "Paused", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

function relDays(
  ts: { toDate?: () => Date; seconds?: number } | null | undefined,
): string {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
  const days = Math.ceil((date.getTime() / 1000 - Date.now() / 1000) / 86400);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days}d`;
}

function fmtDate(
  ts: { toDate?: () => Date; seconds?: number } | null | undefined,
): string {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date((ts.seconds ?? 0) * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(
  ts: { toDate?: () => Date; seconds?: number } | null | undefined,
): string {
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
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// ── page ──────────────────────────────────────────────────────────────────────
export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicShare | null>(null);
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
      <div
        className="sp-root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="sp-spinner" />
        <style>{CSS}</style>
      </div>
    );
  }

  // ── not found ──
  if (notFound) {
    return (
      <div
        className="sp-root"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <AlertTriangle size={36} color="#f59e0b" />
        <div style={{ fontSize: 18, fontWeight: 700 }}>Link not found</div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          This share link has expired or been removed.
        </div>
        <style>{CSS}</style>
      </div>
    );
  }

  const subs = data!.subscriptions ?? [];
  const active = subs.filter((s) => s.status === "subscribed");
  const paused = subs.filter((s) => s.status === "paused");
  const cancelled = subs.filter((s) => s.status === "cancelled");
  const monthly = active.reduce((a, s) => a + s.amount, 0);
  const annual = monthly * 12;
  const pausedAmt = paused.reduce((a, s) => a + s.amount, 0);

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

  const glow = `
    radial-gradient(ellipse 70% 40% at 15% 0%, ${groupColor}22 0%, transparent 65%),
    radial-gradient(ellipse 50% 35% at 85% 90%, rgba(79,172,254,0.07) 0%, transparent 65%)
  `;

  return (
    <div className="sp-root" style={{ backgroundImage: glow }}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sp-header">
        <div className="sp-header-left">
          <div
            className="sp-group-icon mr-2"
            style={{
              background: groupColor + "20",
              border: `1px solid ${groupColor}40`,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: groupColor,
              }}
            />
          </div>
          <div>
            <div className="sp-group-name">{data!.groupName}</div>
            <div className="sp-group-meta">
              Shared by{" "}
              <strong style={{ color: "rgba(255,255,255,0.55)" }}>
                {data!.ownerName}
              </strong>{" "}
              · Updated {timeAgo(data!.updatedAt)}
            </div>
          </div>
        </div>
        <div className="sp-badge">
          <ExternalLink size={10} />
          Read-only
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="sp-body">
        {/* KPI grid */}
        <motion.div
          className="sp-kpi-grid"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {[
            {
              label: "Monthly Spend",
              value: `$${monthly.toFixed(2)}`,
              sub: `${active.length} active`,
              Icon: DollarSign,
              accent: "#7c6ef7",
            },
            {
              label: "Annual Projected",
              value: `$${annual.toFixed(0)}`,
              sub: "At current rate",
              Icon: TrendingUp,
              accent: "#60a5fa",
            },
            {
              label: "Due This Week",
              value: String(dueWeek),
              sub: "upcoming renewals",
              Icon: Calendar,
              accent: dueWeek > 0 ? "#f59e0b" : "#60a5fa",
            },
            {
              label: "Potential Savings",
              value: `$${pausedAmt.toFixed(2)}/mo`,
              sub: `${paused.length} paused`,
              Icon: RefreshCw,
              accent: "#22c55e",
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={cardIn}
              className="sp-card sp-kpi-card"
            >
              <div
                className="sp-kpi-icon"
                style={{ background: kpi.accent + "1a" }}
              >
                <kpi.Icon size={15} color={kpi.accent} />
              </div>
              <div className="sp-kpi-value">{kpi.value}</div>
              <div className="sp-kpi-label">{kpi.label}</div>
              <div className="sp-kpi-sub">{kpi.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Savings alert */}
        {pausedAmt > 0 && (
          <motion.div
            variants={cardIn}
            initial="hidden"
            animate="show"
            className="sp-alert"
          >
            <AlertTriangle
              size={15}
              color="#f59e0b"
              style={{ flexShrink: 0 }}
            />
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700, color: "#f59e0b" }}>
                ${pausedAmt.toFixed(2)}/mo
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                {" "}
                could be saved by cancelling {paused.length} paused service
                {paused.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        )}

        {/* Main two-col layout */}
        <div className="sp-main-grid">
          {/* Subscription list */}
          <motion.div
            variants={cardIn}
            initial="hidden"
            animate="show"
            className="sp-card"
          >
            <div className="sp-section-title">Subscriptions</div>
            <div className="sp-section-sub">
              {subs.length} service{subs.length !== 1 ? "s" : ""} · sorted by
              next renewal
            </div>

            {subs.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  padding: "24px 0",
                }}
              >
                No subscriptions
              </div>
            ) : (
              <div className="sp-sub-list">
                {[...upcoming, ...cancelled].map((sub, i) => {
                  const meta = STATUS_META[sub.status] ?? STATUS_META.cancelled;
                  const ts = sub.nextDueDate as { seconds?: number } | null;
                  const days = ts
                    ? Math.ceil((ts.seconds! - today) / 86400)
                    : null;
                  const urgent =
                    days !== null && days <= 7 && sub.status !== "cancelled";
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: i * 0.04,
                        ease: "easeOut",
                      }}
                      className="sp-sub-row"
                      style={{
                        borderBottom:
                          i < subs.length - 1
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "none",
                      }}
                    >
                      {/* Logo */}
                      <div
                        className="sp-sub-logo mr-2"
                        style={{
                          background: groupColor + "20",
                          color: groupColor,
                        }}
                      >
                        {sub.logoUrl ? (
                          <img
                            src={sub.logoUrl}
                            alt={sub.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          sub.name
                            .split(/\s+/)
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>

                      {/* Name + desc */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sub.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.3)",
                            marginTop: 1,
                          }}
                        >
                          {sub.description || sub.renewalPeriod}
                        </div>
                      </div>

                      {/* Right side */}
                      <div>
                        <div className="sp-sub-right">
                          {/* {sub.nextDueDate && sub.status !== "cancelled" && (
                            <div
                              className="hidden sm:block"
                              style={{
                                fontSize: 11,
                                fontWeight: urgent ? 600 : 400,
                                color: urgent
                                  ? "#f59e0b"
                                  : "rgba(255,255,255,0.35)",
                                textAlign: "right",
                              }}
                            >
                              {fmtDate(sub.nextDueDate)}
                              <div style={{ fontSize: 10, marginTop: 1 }}>
                                {relDays(sub.nextDueDate)}
                              </div>
                            </div>
                          )} */}
                          <div
                            className="mx-2"
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: meta.bg,
                              color: meta.color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {meta.label}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              minWidth: 50,
                              textAlign: "right",
                            }}
                          >
                            {currencySymbol(sub.currency)}
                            {sub.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className=" ">
                          {sub.nextDueDate && sub.status !== "cancelled" && (
                            <div
                              className=""
                              style={{
                                fontSize: 11,
                                fontWeight: urgent ? 600 : 400,
                                color: urgent
                                  ? "#f59e0b"
                                  : "rgba(255,255,255,0.35)",
                                textAlign: "right",
                              }}
                            >
                              <span>
                               Renew :  {fmtDate(sub.nextDueDate)}
                                <span className="ml-1" style={{ fontSize: 10, marginTop: 1 }}>
                                  ({relDays(sub.nextDueDate)})
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right sidebar */}
          <div className="sp-sidebar">
            {/* Status donut */}
            <motion.div
              variants={cardIn}
              initial="hidden"
              animate="show"
              className="sp-card"
            >
              <div className="sp-section-title" style={{ marginBottom: 14 }}>
                Status Overview
              </div>
              {subs.length > 0 &&
                (() => {
                  const total = subs.length;
                  const ap = (active.length / total) * 100;
                  const pp = (paused.length / total) * 100;
                  const donut = `conic-gradient(#22c55e 0% ${ap}%, #f59e0b ${ap}% ${ap + pp}%, #ef4444 ${ap + pp}% 100%)`;
                  return (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 20 }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: 82,
                          height: 82,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 82,
                            height: 82,
                            borderRadius: "50%",
                            background: donut,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 13,
                            borderRadius: "50%",
                            background: "#0c1020",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 19,
                            fontWeight: 800,
                          }}
                        >
                          {total}
                        </div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 9,
                        }}
                      >
                        {[
                          {
                            label: "Active",
                            count: active.length,
                            color: "#22c55e",
                          },
                          {
                            label: "Paused",
                            count: paused.length,
                            color: "#f59e0b",
                          },
                          {
                            label: "Cancelled",
                            count: cancelled.length,
                            color: "#ef4444",
                          },
                        ].map((row) => (
                          <div
                            key={row.label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: row.color,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12.5,
                                flex: 1,
                                color: "rgba(255,255,255,0.65)",
                              }}
                            >
                              {row.label}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>
                              {row.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
            </motion.div>

            {/* Top expenses */}
            {top3.length > 0 && (
              <motion.div
                variants={cardIn}
                initial="hidden"
                animate="show"
                className="sp-card"
              >
                <div className="sp-section-title" style={{ marginBottom: 14 }}>
                  Top Expenses
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {top3.map((sub, i) => {
                    const pct = monthly > 0 ? (sub.amount / monthly) * 100 : 0;
                    const COLORS = ["#ef4444", "#f97316", "#f59e0b"];
                    return (
                      <div key={sub.id}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600 }}>
                            {sub.name}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            ${sub.amount.toFixed(2)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "rgba(255,255,255,0.07)",
                            borderRadius: 100,
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.1,
                              ease: [0.22, 1, 0.36, 1] as [
                                number,
                                number,
                                number,
                                number,
                              ],
                            }}
                            style={{
                              height: "100%",
                              borderRadius: 100,
                              background: COLORS[i] ?? groupColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Next renewals */}
            {upcoming.slice(0, 5).length > 0 && (
              <motion.div
                variants={cardIn}
                initial="hidden"
                animate="show"
                className="sp-card"
              >
                <div className="sp-section-title" style={{ marginBottom: 14 }}>
                  Next Renewals
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {upcoming.slice(0, 5).map((sub) => {
                    const ts = sub.nextDueDate as { seconds?: number } | null;
                    const days = ts
                      ? Math.ceil((ts.seconds! - today) / 86400)
                      : null;
                    const urg = days !== null && days <= 7;
                    return (
                      <div
                        key={sub.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sub.name}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: urg ? 700 : 400,
                            flexShrink: 0,
                            color: urg ? "#f59e0b" : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {relDays(sub.nextDueDate)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sp-footer">
          <div
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,0.2)",
              marginBottom: 5,
            }}
          >
            Read-only snapshot · Data may not reflect real-time changes
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            Powered by <span style={{ color: "#7c6ef7" }}>SubTrack</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Responsive CSS ─────────────────────────────────────────────────────────────
const CSS = `
  .sp-root {
    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    background: #070a14;
    color: rgba(255,255,255,0.92);
    font-family: system-ui, -apple-system, sans-serif;
    padding-bottom: 60px;
  }

  .sp-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #7c6ef7;
    animation: sp-spin 0.7s linear infinite;
  }
  @keyframes sp-spin { to { transform: rotate(360deg); } }

  /* Header */
  .sp-header {
    position: sticky; top: 0; z-index: 10;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 12;
    background: rgba(7,10,20,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .sp-header-left { display: flex; align-items: center; gap: 12; min-width: 0; }
  .sp-group-icon {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .sp-group-name { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp-group-meta { font-size: 11px; color: rgba(255,255,255,0.32); margin-top: 2px; }
  .sp-badge {
    display: flex; align-items: center; gap: 5; flex-shrink: 0;
    font-size: 10.5px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.35); white-space: nowrap;
  }

  /* Body wrapper */
  .sp-body {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px 0;
    display: flex; flex-direction: column; gap: 18px;
  }

  /* KPI grid — 2 cols on mobile */
  .sp-kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  /* Card base */
  .sp-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 18px;
  }

  /* KPI card internals */
  .sp-kpi-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .sp-kpi-value { font-size: 20px; font-weight: 800; letter-spacing: -0.4px; line-height: 1; }
  .sp-kpi-label { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 5px; }
  .sp-kpi-sub   { font-size: 10px; color: rgba(255,255,255,0.22); margin-top: 2px; }

  /* Alert */
  .sp-alert {
    background: rgba(245,158,11,0.07);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 12px; padding: 12px 16px;
    display: flex; align-items: flex-start; gap: 10;
  }

  /* Section titles */
  .sp-section-title { font-weight: 700; font-size: 14px; }
  .sp-section-sub   { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 3px; margin-bottom: 16px; }

  /* Main layout — single col mobile */
  .sp-main-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Subscription rows */
  .sp-sub-list { display: flex; flex-direction: column; }
  .sp-sub-row {
    display: flex; align-items: center; gap: 12;
    padding: 12px 0;
  }
  .sp-sub-logo {
    width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; overflow: hidden;
  }
  .sp-sub-right {
    display: flex; align-items: center; gap: 8; flex-shrink: 0;
  }

  /* Sidebar */
  .sp-sidebar { display: flex; flex-direction: column; gap: 16px; }

  /* Footer */
  .sp-footer { text-align: center; padding-top: 16px; }

  /* ── Tablet 560px+ ── */
  @media (min-width: 560px) {
    .sp-header { padding: 16px 28px; }
    .sp-body   { padding: 28px 24px 0; }
    .sp-kpi-value { font-size: 22px; }
    .sp-kpi-label { font-size: 11.5px; }
  }

  /* ── Desktop 768px+ ── */
  @media (min-width: 768px) {
    .sp-header { padding: 18px 40px; }
    .sp-group-name { font-size: 18px; }
    .sp-body   { padding: 36px 32px 0; gap: 22px; }
    .sp-kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .sp-kpi-value { font-size: 24px; }
    .sp-kpi-icon  { width: 34px; height: 34px; margin-bottom: 12px; }
    .sp-main-grid {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 18px;
      align-items: start;
    }
    .sp-card { padding: 22px; }
  }

  /* ── Large desktop 1024px+ ── */
  @media (min-width: 1024px) {
    .sp-main-grid { grid-template-columns: 1fr 300px; }
  }
`;
