"use client";

import { useEffect, useState } from "react";
import { X, Plus, Save } from "lucide-react";
import { Group, GroupInput } from "@/types/group";
import { useAuth } from "@/contexts/AuthContext";
import { createGroup, updateGroup } from "@/services/groups";

const COLORS = [
  "#a78bfa", "#60a5fa", "#fb923c", "#f472b6",
  "#34d399", "#f87171", "#fbbf24", "#818cf8",
  "#2dd4bf", "#e879f9",
];

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 11.5, color: "var(--text3)", display: "block",
  marginBottom: 5, fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase",
};
const INPUT: React.CSSProperties = {
  width: "100%", padding: "8px 13px",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 10, color: "var(--text)", fontFamily: "inherit",
  fontSize: 13, outline: "none",
};

interface Props {
  onClose:  () => void;
  group?:   Group;
}

export function GroupFormModal({ onClose, group }: Props) {
  const { user }  = useAuth();
  const isEdit    = !!group;
  const [name,    setName]    = useState(group?.name  ?? "");
  const [color,   setColor]   = useState(group?.color ?? COLORS[0]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    const data: GroupInput = { name: name.trim(), color };
    try {
      if (isEdit) await updateGroup(user.uid, group!.id, data);
      else        await createGroup(user.uid, data);
      onClose();
    } catch {
      setError("Failed to save. Try again.");
      setSaving(false);
    }
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
        borderRadius: 20, padding: 28, width: 400,
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        animation: "fadeInUp 0.22s ease both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? "Edit Group" : "Create Group"}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              {isEdit ? "Update group details" : "Organise subscriptions by category"}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: "var(--text2)", display: "flex",
          }}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Name */}
            <div>
              <label style={FIELD_LABEL}>Group Name</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Streaming, Work, Personal"
                style={INPUT}
                autoFocus
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,110,247,0.15)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";  e.target.style.boxShadow = "none"; }}
              />
              {error && <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>{error}</span>}
            </div>

            {/* Color */}
            <div>
              <label style={FIELD_LABEL}>Colour</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                      background: c,
                      border: color === c ? "3px solid white" : "3px solid transparent",
                      boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                      transition: "all 0.15s",
                      transform: color === c ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 14px", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 10,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: name ? "var(--text)" : "var(--text3)" }}>
                {name || "Group name preview"}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 16px", borderRadius: 10,
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                color: "#fff", border: "none",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
              }}>
                {isEdit ? <Save size={14} /> : <Plus size={14} />}
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Group"}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary" style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "9px 16px", borderRadius: 10,
                background: "var(--surface)", color: "var(--text2)",
                border: "1px solid var(--border)",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                transition: "all 0.15s ease",
              }}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
