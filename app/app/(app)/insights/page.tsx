"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { logoColor, logoInitials } from "@/lib/logoUtils";
import {
  DollarSign, TrendingUp, Calendar, Zap,
  AlertTriangle, BarChart2,
} from "lucide-react";

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPICard({
  title, value, sub, Icon, accent, borderColor,
}: {
  title: string; value: string; sub: string;
  Icon: React.ElementType; accent: string; borderColor?: string;
}) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderLeft: borderColor ? `3px solid ${borderColor}` : "1px solid var(--border)",
      borderRadius: borderColor ? "0 14px 14px 0" : 14,
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: accent + "1a",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={17} color={accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: "var(--text3)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{title}</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const { user }          = useAuth();
  const { subscriptions } = useSubscriptions(user?.uid);
  const { groups }        = useGroupsContext();

  const active    = subscriptions.filter((s) => s.status === "subscribed");
  const paused    = subscriptions.filter((s) => s.status === "paused");
  const cancelled = subscriptions.filter((s) => s.status === "cancelled");

  const monthly    = active.reduce((a, s) => a + s.amount, 0);
  const annual     = monthly * 12;
  const pausedAmt  = paused.reduce((a, s) => a + s.amount, 0);

  const today = Date.now() / 1000;
  const next30 = subscriptions.filter(
    (s) => s.status !== "cancelled" && s.nextDueDate &&
      (s.nextDueDate.toDate().getTime() / 1000 - today) / 86400 <= 30
  );
  const next30Total = next30.reduce((a, s) => a + s.amount, 0);

  const top5 = [...active].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // Group breakdown
  const groupBreakdown = groups.map((g) => {
    const gSubs  = active.filter((s) => s.groupId === g.id);
    const total  = gSubs.reduce((a, s) => a + s.amount, 0);
    return { ...g, subs: gSubs, total };
  }).filter((g) => g.total > 0).sort((a, b) => b.total - a.total);

  // Ungrouped
  const ungroupedSubs  = active.filter((s) => !s.groupId);
  const ungroupedTotal = ungroupedSubs.reduce((a, s) => a + s.amount, 0);

  const RANK_COLORS = ["#ef4444", "#f97316", "#f59e0b", "var(--accent)", "var(--blue)"];

  return (
    <div className="ani" style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPICard
          title="Monthly Recurring" value={`$${monthly.toFixed(2)}`}
          sub={`${active.length} active service${active.length !== 1 ? "s" : ""}`}
          Icon={DollarSign} accent="var(--accent)"
        />
        <KPICard
          title="Annual Projected" value={`$${annual.toFixed(0)}`}
          sub="At current rate"
          Icon={TrendingUp} accent="var(--blue)"
        />
        <KPICard
          title="Due Next 30 Days" value={`$${next30Total.toFixed(2)}`}
          sub={`${next30.length} renewal${next30.length !== 1 ? "s" : ""} upcoming`}
          Icon={Calendar} accent="var(--amber)" borderColor="var(--amber)"
        />
        <KPICard
          title="Potential Savings" value={`$${pausedAmt.toFixed(2)}/mo`}
          sub="Cancel all paused services"
          Icon={Zap} accent="var(--green)" borderColor="var(--green)"
        />
      </div>

      {/* Top expenses + waste */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

        {/* Top expenses */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Top Expenses</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 18 }}>Highest-cost active subscriptions</div>
          {top5.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>No active subscriptions</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {top5.map((sub, i) => {
                const pct = monthly > 0 ? (sub.amount / monthly) * 100 : 0;
                const lc  = logoColor(sub.name);
                const li  = logoInitials(sub.name);
                return (
                  <div key={sub.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: lc + "20", overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, fontWeight: 800, color: lc,
                      }}>
                        {sub.logoUrl
                          ? <img src={sub.logoUrl} alt={sub.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : li.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{sub.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>${sub.amount.toFixed(2)}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)", minWidth: 34, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 100, width: `${pct}%`, background: RANK_COLORS[i] ?? "var(--accent)", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Waste detection */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Waste Detection</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 18 }}>Services you might not be using</div>

          {paused.length === 0 && cancelled.length === 0 ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 11,
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
            }}>
              <Zap size={15} color="var(--green)" />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>No waste detected</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {paused.map((sub) => (
                <div key={sub.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 11,
                  background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
                }}>
                  <AlertTriangle size={15} color="var(--amber)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {sub.name}
                      <span style={{ fontSize: 10.5, background: "var(--amberbg)", color: "var(--amber)", borderRadius: 6, padding: "2px 7px", marginLeft: 7, fontWeight: 700 }}>Paused</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>${sub.amount.toFixed(2)}/mo still allocated</div>
                  </div>
                </div>
              ))}
              {pausedAmt > 0 && (
                <div style={{
                  padding: "10px 14px", borderRadius: 11, marginTop: 4,
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)",
                  fontSize: 12, color: "var(--text3)",
                }}>
                  <span style={{ color: "var(--red)", fontWeight: 700 }}>${(pausedAmt * 12).toFixed(0)}/year</span> could be saved by cancelling paused services
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spend by category */}
      {groupBreakdown.length > 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 22,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Spend by Category</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>Monthly cost breakdown across your groups</div>

          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(groupBreakdown.length + (ungroupedTotal > 0 ? 1 : 0), 4)}, 1fr)`, gap: 14, marginBottom: 20 }}>
            {groupBreakdown.map((g) => (
              <div key={g.id} style={{
                padding: "14px 16px", borderRadius: 12,
                background: g.color + "10", border: `1px solid ${g.color}28`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{g.name}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", color: g.color }}>${g.total.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                  {g.subs.length} service{g.subs.length !== 1 ? "s" : ""} · {monthly > 0 ? ((g.total / monthly) * 100).toFixed(0) : 0}% of total
                </div>
              </div>
            ))}
            {ungroupedTotal > 0 && (
              <div style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text3)" }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Ungrouped</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px" }}>${ungroupedTotal.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>
                  {ungroupedSubs.length} service{ungroupedSubs.length !== 1 ? "s" : ""} · {monthly > 0 ? ((ungroupedTotal / monthly) * 100).toFixed(0) : 0}% of total
                </div>
              </div>
            )}
          </div>

          {/* Stacked bar */}
          {monthly > 0 && (
            <>
              <div style={{ height: 10, borderRadius: 100, overflow: "hidden", display: "flex" }}>
                {groupBreakdown.map((g) => (
                  <div key={g.id} style={{
                    height: "100%", background: g.color,
                    width: `${(g.total / monthly) * 100}%`,
                    transition: "width 0.8s ease",
                  }} />
                ))}
                {ungroupedTotal > 0 && (
                  <div style={{
                    height: "100%", background: "var(--text3)",
                    width: `${(ungroupedTotal / monthly) * 100}%`,
                    transition: "width 0.8s ease",
                  }} />
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 10 }}>
                {groupBreakdown.map((g) => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>{g.name} {((g.total / monthly) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {([
          { label: "Active",    items: active,    amt: monthly,   color: "var(--green)", bg: "var(--greenbg)" },
          { label: "Paused",    items: paused,    amt: pausedAmt, color: "var(--amber)", bg: "var(--amberbg)" },
          { label: "Cancelled", items: cancelled, amt: cancelled.reduce((a, s) => a + s.amount, 0), color: "var(--red)", bg: "var(--redbg)" },
        ] as const).map((row) => (
          <div key={row.label} style={{
            padding: "18px 20px", borderRadius: 14,
            background: row.bg, border: `1px solid ${row.color}28`,
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: row.color, letterSpacing: "-1px", lineHeight: 1 }}>{row.items.length}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: row.color, marginTop: 4 }}>{row.label} Services</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>${row.amt.toFixed(2)}/mo</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>${(row.amt * 12).toFixed(0)}/year</div>
          </div>
        ))}
      </div>

      {/* Empty state when no data */}
      {subscriptions.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <BarChart2 size={40} color="var(--text3)" />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>No data yet</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>Add subscriptions to see your spending insights</div>
        </div>
      )}
    </div>
  );
}
