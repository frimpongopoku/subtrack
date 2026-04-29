"use client";

import Image from "next/image";
import { RefreshCw, Pause, Play, Edit2, X, Trash2 } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { Group } from "@/types/group";
import { StatusBadge } from "./StatusBadge";
import { logoColor, logoInitials } from "@/lib/logoUtils";

interface Props {
  sub:      Subscription;
  groups:   Group[];
  index:    number;
  onEdit:   (sub: Subscription) => void;
  onRenew:  (sub: Subscription) => void;
  onStatus: (sub: Subscription, status: "subscribed" | "paused" | "cancelled") => void;
  onDelete: (sub: Subscription) => void;
}

const BTN: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  flex: 1, padding: "5px 11px", borderRadius: 10,
  fontSize: 11.5, fontWeight: 600, fontFamily: "inherit",
  cursor: "pointer", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text2)",
  transition: "all 0.15s ease", whiteSpace: "nowrap",
};

export function SubscriptionCard({ sub, groups, index, onEdit, onRenew, onStatus, onDelete }: Props) {
  const group  = groups.find((g) => g.id === sub.groupId);
  const lc     = logoColor(sub.name);
  const li     = logoInitials(sub.name);
  const today  = Date.now() / 1000;
  const dueTs  = sub.nextDueDate ? sub.nextDueDate.toDate().getTime() / 1000 : 0;
  const days   = Math.ceil((dueTs - today) / 86400);
  const urgent = days <= 7 && sub.status !== "cancelled";
  const dueLabel = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`;

  const fmt = (ts: { toDate: () => Date } | null | undefined) =>
    ts?.toDate?.().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ?? "—";

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 18,
      display: "flex", flexDirection: "column", gap: 14,
      transition: "all 0.18s ease", cursor: "pointer",
      animation: `fadeInUp 0.28s ease ${index * 0.04}s both`,
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "var(--surface2)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border2)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 36px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "var(--surface)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: lc + "20", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: lc, letterSpacing: "-0.3px",
        }}>
          {sub.logoUrl ? (
            <Image src={sub.logoUrl} alt={sub.name} width={46} height={46}
              style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          ) : li}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>{sub.name}</span>
            <StatusBadge status={sub.status} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{sub.description}</div>
        </div>

        {group && (
          <div style={{
            fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 6, flexShrink: 0,
            background: group.color + "1a", color: group.color,
          }}>{group.name}</div>
        )}
      </div>

      {/* Price */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: 4,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 10, border: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
          {sub.currency === "USD" ? "$" : sub.currency === "GHS" ? "₵" : sub.currency === "EUR" ? "€" : "£"}
          {sub.amount.toFixed(2)}
        </span>
        <span style={{ fontSize: 12, color: "var(--text3)" }}>/ {sub.renewalPeriod}</span>
        <div style={{ flex: 1 }} />
        {sub.recurring && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text3)", fontSize: 11 }}>
            <RefreshCw size={11} />Recurring
          </div>
        )}
      </div>

      {/* Dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 9, padding: "9px 12px" }}>
          <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 4 }}>Next Due</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: urgent ? "var(--amber)" : "var(--text)" }}>
            {fmt(sub.nextDueDate)}
            {urgent && <span style={{ fontSize: 10, marginLeft: 5, fontWeight: 500 }}>({dueLabel})</span>}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 9, padding: "9px 12px" }}>
          <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700, marginBottom: 4 }}>Since</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(sub.startDate)}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--border)", paddingTop: 13 }}>
        {sub.status !== "cancelled" && (
          <button className="btn-sm" style={BTN} onClick={() => onRenew(sub)}>
            <RefreshCw size={12} />Renew
          </button>
        )}
        {sub.status === "subscribed" && (
          <button className="btn-sm" style={BTN} onClick={() => onStatus(sub, "paused")}>
            <Pause size={12} />Pause
          </button>
        )}
        {sub.status === "paused" && (
          <button className="btn-sm" style={{ ...BTN, color: "var(--green)", borderColor: "rgba(34,197,94,0.25)" }}
            onClick={() => onStatus(sub, "subscribed")}>
            <Play size={12} />Resume
          </button>
        )}
        <button className="btn-sm" style={BTN} onClick={() => onEdit(sub)}>
          <Edit2 size={12} />Edit
        </button>
        {sub.status !== "cancelled" && (
          <button
            className="btn-danger"
            style={{ ...BTN, color: "var(--red)", background: "var(--redbg)", borderColor: "rgba(239,68,68,0.22)" }}
            onClick={() => onStatus(sub, "cancelled")}
          >
            <X size={12} />Cancel
          </button>
        )}
        {sub.status === "cancelled" && (
          <button
            className="btn-danger"
            style={{ ...BTN, color: "var(--red)", background: "var(--redbg)", borderColor: "rgba(239,68,68,0.22)" }}
            onClick={() => onDelete(sub)}
          >
            <Trash2 size={12} />Delete
          </button>
        )}
      </div>
    </div>
  );
}
