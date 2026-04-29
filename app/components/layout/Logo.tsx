import { RefreshCw } from "lucide-react";

interface LogoProps {
  size?: "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const s = size === "lg" ? 44 : 32;
  const f = size === "lg" ? 18 : 15;
  const r = size === "lg" ? 14 : 10;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: s, height: s, borderRadius: r, flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(124,110,247,0.35)",
      }}>
        <RefreshCw size={f} color="white" />
      </div>
      <span style={{ fontWeight: 800, fontSize: size === "lg" ? 22 : 16, letterSpacing: "-0.3px" }}>
        Sub<span style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>Track</span>
      </span>
    </div>
  );
}
