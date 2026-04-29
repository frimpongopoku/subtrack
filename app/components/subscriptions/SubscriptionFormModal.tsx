"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { X, RefreshCw, Plus, Save, Camera, Trash2 } from "lucide-react";
import Image from "next/image";
import { Subscription, SubscriptionInput } from "@/types/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupsContext } from "@/contexts/GroupsContext";
import { createSubscription, updateSubscription } from "@/services/subscriptions";
import { uploadLogo } from "@/lib/storage";
import { db } from "@/lib/firestore";
import { logoColor, logoInitials } from "@/lib/logoUtils";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  name:          z.string().min(1, "Name is required"),
  description:   z.string().optional(),
  amount:        z.number().positive("Must be greater than 0"),
  currency:      z.enum(["USD", "GHS", "EUR", "GBP"]),
  recurring:     z.boolean(),
  renewalPeriod: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  status:        z.enum(["subscribed", "paused", "cancelled"]),
  groupId:       z.string().nullable(),
  startDate:     z.string().min(1, "Start date required"),
  nextDueDate:   z.string().min(1, "Next due date required"),
});

type FormValues = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FIELD_LABEL: React.CSSProperties = {
  fontSize: 11.5, color: "var(--text3)", display: "block",
  marginBottom: 5, fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase",
};

const INPUT: React.CSSProperties = {
  width: "100%", padding: "8px 13px",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 10, color: "var(--text)", fontFamily: "inherit",
  fontSize: 13, outline: "none", transition: "border-color 0.15s",
};

function toDateString(ts: Timestamp | undefined): string {
  if (!ts?.toDate) return "";
  return ts.toDate().toISOString().slice(0, 10);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onClose:       () => void;
  subscription?: Subscription;
}

export function SubscriptionFormModal({ onClose, subscription }: Props) {
  const { user }   = useAuth();
  const { groups } = useGroupsContext();
  const isEdit     = !!subscription;

  // Logo state — separate from the RHF form
  const [logoFile,    setLogoFile]    = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(subscription?.logoUrl ?? null);
  const [removeLogo,  setRemoveLogo]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchedName = useRef("");

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          subscription?.name          ?? "",
      description:   subscription?.description   ?? "",
      amount:        subscription?.amount        ?? 0,
      currency:      subscription?.currency      ?? "USD",
      recurring:     subscription?.recurring     ?? true,
      renewalPeriod: subscription?.renewalPeriod ?? "monthly",
      status:        subscription?.status        ?? "subscribed",
      groupId:       subscription?.groupId       ?? null,
      startDate:     toDateString(subscription?.startDate),
      nextDueDate:   toDateString(subscription?.nextDueDate),
    },
  });

  const recurring  = watch("recurring");
  const nameValue  = watch("name");
  watchedName.current = nameValue;

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow   = "0 0 0 3px rgba(124,110,247,0.15)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow   = "none";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(values: FormValues) {
    if (!user) return;

    const data: SubscriptionInput = {
      name:          values.name,
      description:   values.description  ?? "",
      amount:        values.amount,
      currency:      values.currency,
      recurring:     values.recurring,
      renewalPeriod: values.renewalPeriod,
      status:        values.status,
      groupId:       values.groupId,
      startDate:     Timestamp.fromDate(new Date(values.startDate)),
      nextDueDate:   Timestamp.fromDate(new Date(values.nextDueDate)),
    };

    if (isEdit) {
      await updateSubscription(user.uid, subscription!.id, data, values.name);
      // Handle logo update
      if (logoFile) {
        const url = await uploadLogo(user.uid, subscription!.id, logoFile);
        await updateDoc(doc(db, "users", user.uid, "subscriptions", subscription!.id), { logoUrl: url });
      } else if (removeLogo) {
        await updateDoc(doc(db, "users", user.uid, "subscriptions", subscription!.id), { logoUrl: null });
      }
    } else {
      const newId = await createSubscription(user.uid, data);
      if (logoFile) {
        const url = await uploadLogo(user.uid, newId, logoFile);
        await updateDoc(doc(db, "users", user.uid, "subscriptions", newId), { logoUrl: url });
      }
    }
    onClose();
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Avatar for logo picker area
  const lc = logoColor(nameValue || subscription?.name || "");
  const li = logoInitials(nameValue || subscription?.name || "?");

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
        borderRadius: 20, padding: 28, width: 480,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        animation: "fadeInUp 0.22s ease both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              {isEdit ? "Edit Subscription" : "Add Subscription"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              {isEdit ? "Update the details below" : "Track a new recurring service"}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: "var(--text2)",
            display: "flex", alignItems: "center",
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Logo picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 60, height: 60, borderRadius: 16, cursor: "pointer",
                background: logoPreview ? "transparent" : lc + "20",
                border: "2px dashed " + (logoPreview ? "transparent" : "rgba(255,255,255,0.12)"),
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", transition: "all 0.15s",
              }}
            >
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="logo"
                  width={60}
                  height={60}
                  style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: 14 }}
                  unoptimized={logoPreview.startsWith("blob:")}
                />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 800, color: lc }}>{li}</span>
              )}
            </div>
            {/* Camera overlay */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: -4, right: -4,
                width: 22, height: 22, borderRadius: 8,
                background: "var(--accent)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #0e1224",
              }}
            >
              <Camera size={11} color="#fff" />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              {logoPreview ? "Logo uploaded" : "Service logo"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text3)", marginBottom: 8 }}>
              PNG, JPG, WebP · max 2 MB
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  fontSize: 11.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  padding: "4px 10px", borderRadius: 7,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  color: "var(--text2)",
                }}
              >
                {logoPreview ? "Change" : "Upload"}
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    fontSize: 11.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                    padding: "4px 10px", borderRadius: 7,
                    background: "var(--redbg)", border: "1px solid rgba(239,68,68,0.22)",
                    color: "var(--red)", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <Trash2 size={10} />Remove
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

            {/* Name + Group */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={FIELD_LABEL}>Service Name</label>
                <input {...register("name")} placeholder="e.g. Netflix" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                {errors.name && <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>{errors.name.message}</span>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Group</label>
                <select {...register("groupId")} style={{ ...INPUT, appearance: "none", cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="">No group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={FIELD_LABEL}>Description</label>
              <input {...register("description")} placeholder="e.g. Standard plan with ads" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Amount + Currency + Period */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={FIELD_LABEL}>Amount</label>
                <input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" style={INPUT} onFocus={onFocus} onBlur={onBlur} />
                {errors.amount && <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>{errors.amount.message}</span>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Currency</label>
                <select {...register("currency")} style={{ ...INPUT, appearance: "none", cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="USD">USD</option>
                  <option value="GHS">GHS</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label style={FIELD_LABEL}>Period</label>
                <select {...register("renewalPeriod")} style={{ ...INPUT, appearance: "none", cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={FIELD_LABEL}>Start Date</label>
                <input {...register("startDate")} type="date" style={{ ...INPUT, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} />
                {errors.startDate && <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>{errors.startDate.message}</span>}
              </div>
              <div>
                <label style={FIELD_LABEL}>Next Due Date</label>
                <input {...register("nextDueDate")} type="date" style={{ ...INPUT, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} />
                {errors.nextDueDate && <span style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "block" }}>{errors.nextDueDate.message}</span>}
              </div>
            </div>

            {/* Status (edit only) */}
            {isEdit && (
              <div>
                <label style={FIELD_LABEL}>Status</label>
                <select {...register("status")} style={{ ...INPUT, appearance: "none", cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="subscribed">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {/* Recurring toggle */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RefreshCw size={14} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Recurring subscription</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Auto-renews on due date</div>
                </div>
              </div>
              <div
                onClick={() => setValue("recurring", !recurring)}
                style={{
                  width: 40, height: 22, borderRadius: 100, cursor: "pointer",
                  background: recurring ? "var(--accentbg)" : "rgba(255,255,255,0.1)",
                  border: recurring ? "1px solid rgba(124,110,247,0.35)" : "1px solid var(--border2)",
                  position: "relative", transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 2, left: 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: recurring ? "var(--accent)" : "var(--text3)",
                  transform: recurring ? "translateX(18px)" : "none",
                  transition: "transform 0.2s, background 0.2s",
                }} />
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isEdit ? <Save size={14} /> : <Plus size={14} />}
                {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Subscription"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{
                  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: "9px 16px", borderRadius: 10,
                  background: "var(--surface)", color: "var(--text2)",
                  border: "1px solid var(--border)",
                  fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
