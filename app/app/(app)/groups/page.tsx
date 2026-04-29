"use client";

import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useModal } from "@/contexts/ModalContext";
import { GroupCard } from "@/components/groups/GroupCard";
import { GroupFormModal } from "@/components/groups/GroupFormModal";
import { Group } from "@/types/group";

export default function GroupsPage() {
  const { user }          = useAuth();
  const { groups }        = useGroupsContext();
  const { subscriptions } = useSubscriptions(user?.uid);
  const { openAdd }       = useModal();

  const [groupModal, setGroupModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Group | null>(null);

  const grandTotal = subscriptions
    .filter((s) => s.status === "subscribed")
    .reduce((a, s) => a + s.amount, 0);

  function openEdit(group: Group) {
    setEditTarget(group);
    setGroupModal("edit");
  }

  // Pre-open "Add New" subscription modal from within a group card
  function handleAddSub() {
    openAdd();
  }

  return (
    <div className="ani" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Overview strip */}
      {groups.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(groups.length, 4)}, 1fr)`, gap: 14 }}>
          {groups.map((g) => {
            const gSubs  = subscriptions.filter((s) => s.groupId === g.id && s.status === "subscribed");
            const total  = gSubs.reduce((a, s) => a + s.amount, 0);
            const share  = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(0) : "0";
            return (
              <div key={g.id} style={{
                background: "var(--surface)", border: `1px solid var(--border)`,
                borderLeft: `3px solid ${g.color}`,
                borderRadius: "0 14px 14px 0",
                padding: 20, transition: "all 0.15s ease", cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
                  <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>{g.name}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px" }}>${total.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                  {gSubs.length} active · {share}% of total
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden", marginTop: 10 }}>
                  <div style={{ height: "100%", borderRadius: 100, width: `${share}%`, background: g.color, transition: "width 0.8s" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group cards */}
      {groups.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <FolderOpen size={40} color="var(--text3)" />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>No groups yet</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>Create a group to organise your subscriptions</div>
          <button
            onClick={() => setGroupModal("create")}
            style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "#fff", border: "none",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <Plus size={14} />Create First Group
          </button>
        </div>
      ) : (
        <>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              subscriptions={subscriptions.filter((s) => s.groupId === group.id)}
              onEdit={openEdit}
              onAddSub={handleAddSub}
              defaultOpen={groups.length === 1}
            />
          ))}

          {/* Create new group button */}
          <button
            className="btn-dashed"
            onClick={() => setGroupModal("create")}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: 14, cursor: "pointer", fontFamily: "inherit",
              background: "transparent", color: "var(--text2)",
              border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: 14, fontSize: 13, fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <Plus size={16} />Create New Group
          </button>
        </>
      )}

      {/* Modals */}
      {groupModal === "create" && (
        <GroupFormModal onClose={() => setGroupModal(null)} />
      )}
      {groupModal === "edit" && editTarget && (
        <GroupFormModal
          group={editTarget}
          onClose={() => { setGroupModal(null); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
