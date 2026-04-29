"use client";

import { Search, Bell, Plus, DollarSign } from "lucide-react";
import { usePathname } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSearch } from "@/contexts/SearchContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/subscriptions": "Subscriptions",
  "/groups":        "Groups",
  "/insights":      "Insights",
  "/activity":      "Activity",
  "/settings":      "Settings",
};

export function Topbar() {
  const { query, setQuery } = useSearch();
  const pathname            = usePathname();
  const { openAdd }         = useModal();
  const { user }            = useAuth();
  const { subscriptions }   = useSubscriptions(user?.uid);

  const monthlyTotal = subscriptions
    .filter((s) => s.status === "subscribed")
    .reduce((a, s) => a + s.amount, 0);

  const title = PAGE_TITLES[pathname] ?? "";

  return (
    <div style={{
      height: "var(--th)", flexShrink: 0,
      display: "flex", alignItems: "center", gap: 12, padding: "0 22px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(7,10,20,0.7)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    }}>
      <div style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.3px", minWidth: 140 }}>
        {title}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 340, position: "relative", marginLeft: 12 }}>
        <div style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: "var(--text3)",
        }}>
          <Search size={14} />
        </div>
        <input
          style={{
            width: "100%", padding: "8px 13px 8px 34px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, color: "var(--text)", fontFamily: "inherit",
            fontSize: 13, outline: "none",
          }}
          placeholder="Search subscriptions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Live monthly spend badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        background: "var(--accentbg)", border: "1px solid rgba(124,110,247,0.22)",
        borderRadius: 10, padding: "6px 13px", marginRight: 8,
      }}>
        <DollarSign size={13} color="var(--accent)" />
        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--accent)" }}>
          ${monthlyTotal.toFixed(2)}
        </span>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>/mo</span>
      </div>

      <button style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "7px 10px", borderRadius: 10, marginRight: 8,
        background: "var(--surface)", color: "var(--text2)",
        border: "1px solid var(--border)", cursor: "pointer",
      }}>
        <Bell size={16} />
      </button>

      <button
        onClick={openAdd}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 15px", borderRadius: 10,
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        <Plus size={14} color="white" />Add New
      </button>
    </div>
  );
}
