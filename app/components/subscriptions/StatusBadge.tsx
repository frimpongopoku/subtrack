import { SubscriptionStatus } from "@/types/subscription";

const CONFIG: Record<SubscriptionStatus, { label: string; bg: string; color: string }> = {
  subscribed: { label: "● Active",    bg: "var(--greenbg)", color: "var(--green)" },
  paused:     { label: "⏸ Paused",   bg: "var(--amberbg)", color: "var(--amber)" },
  cancelled:  { label: "✕ Cancelled", bg: "var(--redbg)",   color: "var(--red)"   },
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const { label, bg, color } = CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 100,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.2px",
      background: bg, color,
    }}>
      {label}
    </span>
  );
}
