"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { ActivityLog, LogType } from "@/types/log";
import {
  RefreshCw, Pause, Play, X, Plus, Edit2, Activity,
} from "lucide-react";

const LOG_META: Record<LogType, { label: string; color: string; Icon: React.ElementType }> = {
  created:   { label: "Added",     color: "var(--accent)",  Icon: Plus     },
  renewed:   { label: "Renewed",   color: "var(--green)",   Icon: RefreshCw },
  paused:    { label: "Paused",    color: "var(--amber)",   Icon: Pause    },
  resumed:   { label: "Resumed",   color: "var(--green)",   Icon: Play     },
  cancelled: { label: "Cancelled", color: "var(--red)",     Icon: X        },
  edited:    { label: "Edited",    color: "var(--blue)",    Icon: Edit2    },
};

function fmt(log: ActivityLog): string {
  const ts = log.createdAt?.toDate?.();
  if (!ts) return "";
  const now   = Date.now();
  const diffS = Math.floor((now - ts.getTime()) / 1000);
  if (diffS < 60)   return "Just now";
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`;
  if (diffS < 86400 * 7) return `${Math.floor(diffS / 86400)}d ago`;
  return ts.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Group logs by calendar date
function groupByDate(logs: ActivityLog[]): { label: string; logs: ActivityLog[] }[] {
  const map = new Map<string, ActivityLog[]>();
  for (const log of logs) {
    const ts = log.createdAt?.toDate?.();
    if (!ts) continue;
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let key: string;
    if (ts.toDateString() === today.toDateString())     key = "Today";
    else if (ts.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else key = ts.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  }
  return Array.from(map.entries()).map(([label, logs]) => ({ label, logs }));
}

export default function ActivityPage() {
  const { user }       = useAuth();
  const { logs, loading } = useActivityLogs(user?.uid);
  const groups         = groupByDate(logs);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "3px solid var(--border2)", borderTopColor: "var(--accent)",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="ani" style={{
        textAlign: "center", padding: "80px 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <Activity size={40} color="var(--text3)" />
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>No activity yet</div>
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          Actions like renewals, pauses, and edits will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="ani" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {groups.map(({ label, logs: dayLogs }) => (
        <div key={label}>
          {/* Date header */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: "0.8px",
            marginBottom: 12,
          }}>{label}</div>

          {/* Log entries */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {dayLogs.map((log, i) => {
              const meta = LOG_META[log.type] ?? LOG_META.edited;
              const Icon = meta.Icon;
              const isLast = i === dayLogs.length - 1;

              return (
                <div key={log.id} style={{ display: "flex", gap: 14, position: "relative" }}>
                  {/* Timeline line */}
                  {!isLast && (
                    <div style={{
                      position: "absolute", left: 15, top: 32,
                      width: 2, bottom: 0,
                      background: "var(--border)", zIndex: 0,
                    }} />
                  )}

                  {/* Icon dot */}
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: meta.color + "1a", border: `1.5px solid ${meta.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1, marginTop: 2,
                  }}>
                    <Icon size={13} color={meta.color} />
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, paddingBottom: isLast ? 0 : 16,
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: "11px 14px",
                    marginBottom: isLast ? 0 : 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{log.subName}</span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                        background: meta.color + "1a", color: meta.color,
                      }}>{meta.label}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: "auto" }}>
                        {fmt(log)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{log.note}</div>
                    {log.previousStatus && log.newStatus && log.type !== "renewed" && (
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                        <span style={{ color: "var(--text2)" }}>{log.previousStatus}</span>
                        {" → "}
                        <span style={{ color: meta.color }}>{log.newStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
