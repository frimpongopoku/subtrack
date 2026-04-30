"use client";

import { useEffect, useState } from "react";
import { X, Link2, Copy, Check, RefreshCw, Trash2 } from "lucide-react";
import { Group } from "@/types/group";
import { Subscription } from "@/types/subscription";
import { generateShare, updateShare, stopSharing } from "@/services/sharing";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  group:         Group;
  subscriptions: Subscription[];
  onClose:       () => void;
}

export function ShareModal({ group, subscriptions, onClose }: Props) {
  const { user }         = useAuth();
  const [busy, setBusy]  = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken]   = useState(group.shareToken ?? "");

  const shareUrl = token
    ? `${window.location.origin}/share/${token}`
    : "";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleGenerate() {
    if (!user) return;
    setBusy(true);
    try {
      const t = await generateShare(user.uid, group, subscriptions, user.displayName ?? "Someone");
      setToken(t);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!user) return;
    setBusy(true);
    try {
      await updateShare({ ...group, shareToken: token }, subscriptions, user.displayName ?? "Someone");
    } finally {
      setBusy(false);
    }
  }

  async function handleStop() {
    if (!user) return;
    if (!confirm("Stop sharing this group? The link will stop working immediately.")) return;
    setBusy(true);
    try {
      await stopSharing(user.uid, { ...group, shareToken: token });
      setToken("");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.62)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#0e1224", border: "1px solid var(--border2)",
        borderRadius: 20, padding: 28, width: 460,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        animation: "fadeInUp 0.22s ease both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: group.color }} />
              <div style={{ fontWeight: 800, fontSize: 17 }}>Share {group.name}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
              Anyone with the link can view this group's subscriptions and insights
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "6px 10px", cursor: "pointer",
            color: "var(--text2)", display: "flex",
          }}><X size={15} /></button>
        </div>

        {token ? (
          <>
            {/* Share URL */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11.5, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 8 }}>
                Shareable Link
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 13px",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 10, minWidth: 0,
                }}>
                  <Link2 size={13} color="var(--text3)" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: 12.5, color: "var(--text2)", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{shareUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-sm"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "9px 14px", borderRadius: 10,
                    background: copied ? "var(--greenbg)" : "var(--surface)",
                    border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                    color: copied ? "var(--green)" : "var(--text2)",
                    fontFamily: "inherit", fontSize: 12.5, fontWeight: 600,
                    cursor: "pointer", flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Status */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>Active</span>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>· {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""} in snapshot</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleUpdate}
                disabled={busy}
                className="btn-sm"
                style={{
                  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
                }}
              >
                <RefreshCw size={13} />{busy ? "Updating…" : "Update Snapshot"}
              </button>
              <button
                onClick={handleStop}
                disabled={busy}
                className="btn-danger"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 14px", borderRadius: 10,
                  background: "var(--redbg)", color: "var(--red)",
                  border: "1px solid rgba(239,68,68,0.22)",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
                }}
              >
                <Trash2 size={13} />Stop Sharing
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 12, textAlign: "center" }}>
              The link shows a snapshot. Click "Update Snapshot" after adding or changing subscriptions.
            </div>
          </>
        ) : (
          <>
            {/* Not yet shared */}
            <div style={{
              textAlign: "center", padding: "28px 0 24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: group.color + "1a", border: `1px solid ${group.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Link2 size={22} color={group.color} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>This group isn't shared yet</div>
              <div style={{ fontSize: 12.5, color: "var(--text3)", maxWidth: 320, lineHeight: 1.6 }}>
                Generate a link to share a read-only snapshot of this group's subscriptions and spending insights with anyone.
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={busy}
              style={{
                width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 16px", borderRadius: 10,
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                color: "#fff", border: "none",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
              }}
            >
              <Link2 size={14} />{busy ? "Generating…" : "Generate Share Link"}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
