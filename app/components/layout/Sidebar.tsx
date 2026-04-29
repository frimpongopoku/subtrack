"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, CreditCard, FolderOpen, BarChart2,
  Clock, Settings, LogOut,
} from "lucide-react";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "@/lib/nav";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { signOut } from "@/lib/auth";

const ICON_MAP = {
  dashboard:     LayoutDashboard,
  subscriptions: CreditCard,
  groups:        FolderOpen,
  insights:      BarChart2,
  activity:      Clock,
};

export function Sidebar() {
  const pathname          = usePathname();
  const { user }          = useAuth();
  const router            = useRouter();
  const { groups }        = useGroupsContext();
  const { subscriptions } = useSubscriptions(user?.uid);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div style={{
      width: "var(--sw)", height: "100vh", flexShrink: 0,
      display: "flex", flexDirection: "column",
      padding: "18px 10px",
      borderRight: "1px solid var(--border)",
      background: "rgba(255,255,255,0.018)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    }}>
      <div style={{ padding: "4px 12px 20px" }}>
        <Logo />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const Icon   = ICON_MAP[item.icon];
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                fontSize: 13.5, fontWeight: 500,
                color: active ? "var(--accent)" : "var(--text2)",
                background: active ? "var(--accentbg)" : "transparent",
                border: active ? "1px solid rgba(124,110,247,0.2)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s ease",
                userSelect: "none",
              }}>
                <Icon size={16} />
                {item.label}
                {item.id === "subscriptions" && subscriptions.length > 0 && (
                  <span style={{
                    marginLeft: "auto", fontSize: 10, fontWeight: 700,
                    background: "rgba(255,255,255,0.07)", borderRadius: 100,
                    padding: "1px 7px", color: "var(--text3)",
                  }}>{subscriptions.length}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: "var(--border)", margin: "14px 4px" }} />

      {/* Real groups from Firestore */}
      <div style={{ padding: "0 4px", flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.8px",
          textTransform: "uppercase", color: "var(--text3)",
          padding: "0 8px", marginBottom: 8,
        }}>Groups</div>

        {groups.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text3)", padding: "4px 8px" }}>
            No groups yet
          </div>
        ) : (
          groups.map((g) => (
            <Link key={g.id} href="/groups" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                fontSize: 13, fontWeight: 500, color: "var(--text2)",
                cursor: "pointer", transition: "all 0.15s ease",
                border: "1px solid transparent",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                {g.name}
              </div>
            </Link>
          ))
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "10px 4px 8px" }} />

      <Link href="/settings" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 10,
          fontSize: 13.5, fontWeight: 500,
          color: pathname === "/settings" ? "var(--accent)" : "var(--text2)",
          background: pathname === "/settings" ? "var(--accentbg)" : "transparent",
          border: pathname === "/settings" ? "1px solid rgba(124,110,247,0.2)" : "1px solid transparent",
          cursor: "pointer", transition: "all 0.15s ease",
        }}>
          <Settings size={16} />Settings
        </div>
      </Link>

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", marginTop: 4,
      }}>
        {user?.photoURL ? (
          <Image
            src={user.photoURL} alt={user.displayName ?? "User"}
            width={32} height={32}
            style={{ borderRadius: "50%", flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "white",
          }}>{initials}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.displayName ?? "User"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email ?? ""}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text3)", display: "flex" }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
