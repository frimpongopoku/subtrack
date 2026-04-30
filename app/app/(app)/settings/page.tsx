"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { updateProfile, deleteUser } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Download, Trash2, Save, User } from "lucide-react";

// ── shared sub-components ─────────────────────────────────────────────────────

function Section({ title, children, danger }: {
  title: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      style={{
        background: "var(--surface)", borderRadius: 14, padding: 24,
        border: danger ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)",
      }}
    >
      <div style={{
        fontWeight: 700, fontSize: 15, marginBottom: 20,
        color: danger ? "var(--red)" : "var(--text)",
      }}>{title}</div>
      {children}
    </motion.div>
  );
}

function Row({ label, desc, control }: {
  label: string; desc?: string; control: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 100, flexShrink: 0,
        background: on ? "var(--accent)" : "rgba(255,255,255,0.12)",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s ease",
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

const SELECT: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 9, color: "var(--text)", fontFamily: "inherit",
  fontSize: 13, padding: "7px 11px", outline: "none",
  cursor: "pointer", appearance: "none" as const,
};

const INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 10, color: "var(--text)", fontFamily: "inherit",
  fontSize: 13, outline: "none",
};

// ── page ──────────────────────────────────────────────────────────────────────
interface UserPrefs {
  currency:     string;
  defaultSort:  string;
  fiscalYear:   string;
  notifRenewal: boolean;
  notifWeekly:  boolean;
  notifMonthly: boolean;
  notifWasted:  boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  currency:     "USD",
  defaultSort:  "dueDate",
  fiscalYear:   "January",
  notifRenewal: true,
  notifWeekly:  true,
  notifMonthly: false,
  notifWasted:  true,
};

export default function SettingsPage() {
  const { user }          = useAuth();
  const { subscriptions } = useSubscriptions(user?.uid);

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [prefs, setPrefs]             = useState<UserPrefs>(DEFAULT_PREFS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs,   setSavingPrefs]   = useState(false);
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [prefsSaved,    setPrefsSaved]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  // Load prefs from Firestore
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPrefs((p) => ({ ...p, ...d }));
        if (d.displayName) setDisplayName(d.displayName);
      }
    });
    return unsub;
  }, [user]);

  async function saveProfile() {
    if (!user || !displayName.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile(auth.currentUser!, { displayName: displayName.trim() });
      await setDoc(doc(db, "users", user.uid), { displayName: displayName.trim() }, { merge: true });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePrefs() {
    if (!user) return;
    setSavingPrefs(true);
    try {
      await setDoc(doc(db, "users", user.uid), prefs, { merge: true });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } finally {
      setSavingPrefs(false);
    }
  }

  function exportCSV() {
    const header = ["Name", "Description", "Amount", "Currency", "Status", "Renewal Period", "Next Due Date", "Start Date", "Group ID", "Recurring"];
    const rows   = subscriptions.map((s) => [
      s.name,
      s.description,
      s.amount.toFixed(2),
      s.currency,
      s.status,
      s.renewalPeriod,
      s.nextDueDate?.toDate?.().toLocaleDateString() ?? "",
      s.startDate?.toDate?.().toLocaleDateString() ?? "",
      s.groupId ?? "",
      s.recurring ? "Yes" : "No",
    ]);
    const csv  = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `subtrack-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!user) return;
    const confirmed = confirm(
      "Delete your account? All subscriptions, groups, and activity logs will be permanently removed. This cannot be undone."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteUser(auth.currentUser!);
    } catch {
      alert("Please sign out and sign back in before deleting your account (Firebase requires recent authentication).");
      setDeleting(false);
    }
  }

  const provider = user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email";
  const initials = (user?.displayName ?? user?.email ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Profile */}
      <Section title="Profile">
        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {user?.photoURL ? (
              <Image
                src={user.photoURL} alt="Avatar" width={56} height={56}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 16px rgba(124,110,247,0.35)",
              }}>{initials}</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{user?.displayName ?? "—"}</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 3 }}>
              {user?.email} · {provider} Account
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={INPUT}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,110,247,0.15)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Email
            </label>
            <input
              value={user?.email ?? ""}
              readOnly
              style={{ ...INPUT, color: "var(--text3)", cursor: "not-allowed" }}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="btn-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10,
              background: profileSaved ? "var(--greenbg)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: profileSaved ? "var(--green)" : "#fff",
              border: profileSaved ? "1px solid rgba(34,197,94,0.3)" : "none",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: savingProfile ? "not-allowed" : "pointer",
              opacity: savingProfile ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            <User size={13} />{profileSaved ? "Saved!" : savingProfile ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Row
          label="Default Currency"
          desc="Used across all spend summaries"
          control={
            <select value={prefs.currency} onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))} style={{ ...SELECT, width: 100 }}>
              <option value="USD">USD $</option>
              <option value="GHS">GHS ₵</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
            </select>
          }
        />
        <Divider />
        <Row
          label="Default Sort Order"
          desc="How subscriptions are ordered by default"
          control={
            <select value={prefs.defaultSort} onChange={(e) => setPrefs((p) => ({ ...p, defaultSort: e.target.value }))} style={{ ...SELECT, width: 168 }}>
              <option value="dueDate">Nearest Due First</option>
              <option value="amount">By Price (High–Low)</option>
              <option value="name">Alphabetical</option>
              <option value="recent">Date Added</option>
            </select>
          }
        />
        <Divider />
        <Row
          label="Fiscal Year Start"
          desc="For annual projection calculations"
          control={
            <select value={prefs.fiscalYear} onChange={(e) => setPrefs((p) => ({ ...p, fiscalYear: e.target.value }))} style={{ ...SELECT, width: 120 }}>
              {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          }
        />
        <div style={{ marginTop: 18 }}>
          <button
            onClick={savePrefs}
            disabled={savingPrefs}
            className="btn-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10,
              background: prefsSaved ? "var(--greenbg)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: prefsSaved ? "var(--green)" : "#fff",
              border: prefsSaved ? "1px solid rgba(34,197,94,0.3)" : "none",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: savingPrefs ? "not-allowed" : "pointer",
              opacity: savingPrefs ? 0.7 : 1,
              transition: "all 0.2s",
            }}
          >
            <Save size={13} />{prefsSaved ? "Saved!" : savingPrefs ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {([
          { key: "notifRenewal", label: "Renewal Reminders",   desc: "Notify 3 days before a subscription renews" },
          { key: "notifWeekly",  label: "Weekly Digest",        desc: "Summary of upcoming renewals every Sunday"  },
          { key: "notifMonthly", label: "Monthly Report",       desc: "Full spending breakdown on the 1st"         },
          { key: "notifWasted",  label: "Wasted Spend Alerts",  desc: "Alert when paused services are still billing"},
        ] as const).map((n, i) => (
          <div key={n.key}>
            {i > 0 && <Divider />}
            <Row
              label={n.label}
              desc={n.desc}
              control={
                <Toggle
                  on={prefs[n.key]}
                  onChange={(v) => {
                    const next = { ...prefs, [n.key]: v };
                    setPrefs(next);
                    if (user) setDoc(doc(db, "users", user.uid), { [n.key]: v }, { merge: true });
                  }}
                />
              }
            />
          </div>
        ))}
      </Section>

      {/* Data & Privacy */}
      <Section title="Data & Privacy">
        <Row
          label="Export Data"
          desc={`Download all ${subscriptions.length} subscription${subscriptions.length !== 1 ? "s" : ""} as CSV`}
          control={
            <button
              onClick={exportCSV}
              className="btn-sm"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 9,
                background: "var(--surface)", border: "1px solid var(--border)",
                color: "var(--text2)", fontSize: 12.5, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Download size={13} />Export CSV
            </button>
          }
        />
        <Divider />
        <Row
          label="Connected Account"
          desc={`${provider} · ${user?.email}`}
          control={
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
              Connected
            </span>
          }
        />
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" danger>
        <Row
          label="Delete Account"
          desc="Permanently delete all data. This cannot be undone."
          control={
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="btn-danger"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 9,
                background: "var(--redbg)", color: "var(--red)",
                border: "1px solid rgba(239,68,68,0.25)",
                fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
                cursor: deleting ? "not-allowed" : "pointer",
                opacity: deleting ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              <Trash2 size={13} />{deleting ? "Deleting…" : "Delete Account"}
            </button>
          }
        />
      </Section>

    </div>
  );
}
