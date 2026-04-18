"use client"

import * as React from "react"
import type { ValuationResultPayload } from "@/types"

interface ValuationResultCardProps {
  data: ValuationResultPayload
  compact?: boolean
  primaryColor?: string
}

function formatEUR(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n)
}

function formatPPS(n: number): string {
  return `${new Intl.NumberFormat("it-IT").format(Math.round(n))} €/m²`
}

function confidenceStyle(level?: "alta" | "media" | "bassa"): {
  bg: string
  border: string
  text: string
  label: string
} {
  if (level === "alta")
    return {
      bg: "#dcfce7",
      border: "#22c55e",
      text: "#14532d",
      label: "Affidabilità alta",
    }
  if (level === "bassa")
    return {
      bg: "#fef3c7",
      border: "#f59e0b",
      text: "#78350f",
      label: "Affidabilità bassa",
    }
  return {
    bg: "#e0e7ff",
    border: "#6366f1",
    text: "#312e81",
    label: "Affidabilità media",
  }
}

function severityStyle(sev: string): { bg: string; border: string; text: string; icon: string } {
  if (sev === "error" || sev === "critical")
    return { bg: "#fee2e2", border: "#ef4444", text: "#7f1d1d", icon: "⚠️" }
  if (sev === "warning")
    return { bg: "#fef3c7", border: "#f59e0b", text: "#78350f", icon: "⚠️" }
  return { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a", icon: "ℹ️" }
}

function agreementStyle(agreement?: "strong" | "medium" | "weak"): { color: string; label: string } {
  if (agreement === "strong") return { color: "#16a34a", label: "in linea" }
  if (agreement === "medium") return { color: "#ca8a04", label: "moderata" }
  return { color: "#dc2626", label: "divergente" }
}

function zoneMatchLabel(match?: string): string | null {
  if (!match) return null
  const map: Record<string, string> = {
    zone_specific: "",
    cap: "Zona dedotta dal CAP",
    city_average: "Media città (zona non specifica)",
    cap_global: "CAP nazionale (dati generici)",
    exact: "",
    partial: "Zona parziale",
    not_found: "Zona non trovata",
  }
  return map[match] ?? null
}

export function ValuationResultCard({
  data,
  compact = true,
  primaryColor = "#2563eb",
}: ValuationResultCardProps) {
  const conf = confidenceStyle(data.confidence)
  const relevantWarnings = (data.warnings || []).filter(
    (w) => w.severity !== "info"
  )
  const infoWarnings = (data.warnings || []).filter((w) => w.severity === "info")
  const zoneNote = zoneMatchLabel(data.omiZoneMatch)
  const cmp = data.comparables
  const showComparables =
    cmp && (cmp.sampleSize ?? 0) >= 2 && cmp.medianPricePerSqm
  const crossCheck = cmp?.crossCheck
  const agreement = agreementStyle(crossCheck?.agreement)
  const deltaPct = crossCheck?.deltaPct
  const padding = compact ? "12px" : "16px"
  const gap = compact ? "10px" : "14px"
  const titleSize = compact ? "13px" : "14px"
  const priceSize = compact ? "22px" : "28px"

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap,
        padding,
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Valore stimato
        </span>
        <span
          style={{
            fontSize: priceSize,
            fontWeight: 700,
            color: primaryColor,
            lineHeight: 1.1,
          }}
        >
          {formatEUR(data.estimatedPrice)}
        </span>
        <span style={{ fontSize: "13px", color: "#4b5563" }}>
          Range: {formatEUR(data.minPrice)} – {formatEUR(data.maxPrice)}
          {data.pricePerSqm ? ` · ${formatPPS(data.pricePerSqm)}` : ""}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            backgroundColor: conf.bg,
            color: conf.text,
            border: `1px solid ${conf.border}`,
          }}
          title={
            data.confidenceScore !== undefined
              ? `Score: ${data.confidenceScore}/100`
              : undefined
          }
        >
          {conf.label}
          {data.confidenceScore !== undefined ? ` · ${data.confidenceScore}` : ""}
        </span>

        {zoneNote && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 500,
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
            }}
          >
            {zoneNote}
          </span>
        )}

        {data.dataCompleteness !== undefined && data.dataCompleteness < 70 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 500,
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
            }}
          >
            Dati immobile: {data.dataCompleteness}%
          </span>
        )}
      </div>

      {showComparables && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Riscontro mercato reale
          </span>
          <span style={{ fontSize: "13px", color: "#111827", fontWeight: 500 }}>
            {formatPPS(cmp!.medianPricePerSqm!)} (mediana su {cmp!.sampleSize}{" "}
            annunci)
          </span>
          {deltaPct !== undefined && (
            <span style={{ fontSize: "12px", color: agreement.color, fontWeight: 500 }}>
              Scostamento da OMI: {deltaPct > 0 ? "+" : ""}
              {deltaPct}% · {agreement.label}
            </span>
          )}
        </div>
      )}

      {relevantWarnings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {relevantWarnings.map((w, i) => {
            const s = severityStyle(w.severity)
            return (
              <div
                key={`${w.code}-${i}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: s.bg,
                  border: `1px solid ${s.border}`,
                  color: s.text,
                  fontSize: "12px",
                  lineHeight: 1.4,
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-start",
                }}
              >
                <span>{s.icon}</span>
                <span style={{ flex: 1 }}>{w.message}</span>
              </div>
            )
          })}
        </div>
      )}

      {data.explanation && (
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.5,
            color: "#374151",
            margin: 0,
          }}
        >
          {data.explanation}
        </p>
      )}

      {infoWarnings.length > 0 && (
        <p
          style={{
            fontSize: "11px",
            color: "#6b7280",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {infoWarnings.map((w) => w.message).join(" ")}
        </p>
      )}
    </div>
  )
}
