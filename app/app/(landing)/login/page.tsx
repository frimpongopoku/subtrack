"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, BarChart2, Clock, Bell, FolderOpen } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/auth";

const FEATURES = [
  { icon: CreditCard,  text: "Track unlimited recurring services"     },
  { icon: BarChart2,   text: "Spot waste with AI-powered insights"    },
  { icon: Clock,       text: "Full audit trail — every renewal logged" },
  { icon: Bell,        text: "Renewal alerts before you get charged"  },
  { icon: FolderOpen,  text: "Organize by team, project or category"  },
];

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleGoogleSignIn() {
    setError("");
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch {
      setError("Sign-in failed. Please try again.");
      setSigningIn(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: `
        radial-gradient(ellipse 60% 60% at 18% 50%, rgba(124,110,247,0.13) 0%, transparent 100%),
        radial-gradient(ellipse 50% 45% at 85% 18%, rgba(79,172,254,0.10) 0%, transparent 100%),
        radial-gradient(ellipse 30% 30% at 50% 90%, rgba(244,63,94,0.05) 0%, transparent 100%)
      `,
    }}>
      <div style={{
        display: "flex", gap: 80, alignItems: "center",
        maxWidth: 1040, padding: "0 48px", width: "100%",
      }}>

        {/* Left — hero */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 28 }}>
            <Logo size="lg" />
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 800, lineHeight: 1.06,
            letterSpacing: "-2px", marginBottom: 18,
          }}>
            Every subscription.<br />
            <span style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>One dashboard.</span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.65, maxWidth: 400, marginBottom: 36 }}>
            Replace scattered emails and forgotten charges with a premium hub.
            Know exactly what you spend, when it renews, and where to cut.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 11, maxWidth: 340 }}>
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: "var(--accentbg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={13} color="var(--accent)" />
                </div>
                <span style={{ fontSize: 13.5, color: "var(--text2)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login card */}
        <div style={{ width: 390, flexShrink: 0, position: "relative" }}>
          {/* Glow */}
          <div style={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,110,247,0.15) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />

          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border2)",
            borderRadius: 24, padding: 36,
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}>
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Welcome back</div>
              <div style={{ fontSize: 14, color: "var(--text2)" }}>
                Sign in to manage your subscriptions
              </div>
            </div>

            {/* Google sign-in button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn || loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", padding: "11px 20px",
                background: signingIn ? "#e0e0e0" : "#fff",
                color: "#1a1a1a",
                border: "none", borderRadius: 11,
                fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                cursor: signingIn ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                opacity: signingIn ? 0.8 : 1,
              }}
            >
              {/* Google "G" logo */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.4 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              {signingIn ? "Signing in…" : "Continue with Google"}
            </button>

            {error && (
              <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "var(--red)" }}>
                {error}
              </p>
            )}

            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: "1px solid var(--border)",
              fontSize: 12, color: "var(--text3)", textAlign: "center", lineHeight: 1.6,
            }}>
              By continuing, you agree to SubTrack&apos;s Terms of Service
              and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
