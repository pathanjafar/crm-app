"use client";

import React from "react";
import { Topbar } from "@/components/Topbar";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Palette,
  Layers,
  RefreshCw,
  Download,
  ArrowRight,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface SettingCardProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--muted)",
            margin: "0 0 10px",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1 }}>
          {value}
        </p>
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function SettingCard({
  icon,
  label,
  desc,
  iconBg,
  iconColor,
  badgeText,
  badgeBg,
  badgeColor,
}: SettingCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.03)" : "var(--surface-1)",
        border: `1px solid ${hovered ? "rgba(110,87,247,0.6)" : "var(--border)"}`,
        borderRadius: 12,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-1px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.2 }}>
            {label}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{desc}</p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 20,
            background: badgeBg,
            color: badgeColor,
          }}
        >
          {badgeText}
        </span>
        <ArrowRight
          size={14}
          style={{
            color: hovered ? "rgba(110,87,247,0.9)" : "var(--muted)",
            transition: "color 0.2s",
          }}
        />
      </div>
    </div>
  );
}

// ── Info chip ─────────────────────────────────────────────────────────────────

function Chip({
  children,
  color = "rgba(110,87,247,0.9)",
  bg = "rgba(110,87,247,0.15)",
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 20,
      }}
    >
      {children}
    </span>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 13,
        cursor: "pointer",
        border: primary ? "1px solid rgba(110,87,247,0.9)" : "1px solid var(--border)",
        background: primary
          ? hovered
            ? "rgba(124,107,248,0.9)"
            : "rgba(110,87,247,0.9)"
          : hovered
          ? "rgba(255,255,255,0.05)"
          : "transparent",
        color: primary ? "#fff" : hovered ? "#fff" : "var(--muted)",
        fontWeight: primary ? 500 : 400,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const stats: StatCardProps[] = [
    {
      label: "Active Modules",
      value: "4",
      icon: <Layers size={18} />,
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "rgba(110,87,247,0.9)",
    },
    {
      label: "Security Status",
      value: "Active",
      icon: <Shield size={18} />,
      iconBg: "rgba(6,182,212,0.12)",
      iconColor: "#22d3ee",
    },
    {
      label: "Notifications",
      value: "12",
      icon: <Bell size={18} />,
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#fbbf24",
    },
    {
      label: "App Version",
      value: "1.0.0",
      icon: <Settings size={18} />,
      iconBg: "rgba(16,185,129,0.12)",
      iconColor: "#34d399",
    },
  ];

  const sections: SettingCardProps[] = [
    {
      icon: <Shield size={18} />,
      label: "Security",
      desc: "Manage authentication, roles & access control for all users.",
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "rgba(110,87,247,0.9)",
      badgeText: "● Active",
      badgeBg: "rgba(16,185,129,0.12)",
      badgeColor: "#34d399",
    },
    {
      icon: <Bell size={18} />,
      label: "Notifications",
      desc: "Configure alert preferences, email & push notification rules.",
      iconBg: "rgba(6,182,212,0.12)",
      iconColor: "#22d3ee",
      badgeText: "12 pending",
      badgeBg: "rgba(245,158,11,0.12)",
      badgeColor: "#fbbf24",
    },
    {
      icon: <Database size={18} />,
      label: "Database",
      desc: "Backup, export, import & manage data storage settings.",
      iconBg: "rgba(16,185,129,0.12)",
      iconColor: "#34d399",
      badgeText: "PostgreSQL",
      badgeBg: "rgba(16,185,129,0.12)",
      badgeColor: "#34d399",
    },
    {
      icon: <Palette size={18} />,
      label: "Appearance",
      desc: "Theme, layout, display density & branding options.",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#fbbf24",
      badgeText: "Dark mode",
      badgeBg: "rgba(99,102,241,0.15)",
      badgeColor: "rgba(110,87,247,0.9)",
    },
  ];

  const infoRows = [
    {
      label: "Version",
      value: <Chip>v 1.0.0</Chip>,
      label2: "Framework",
      value2: <Chip>Next.js 16</Chip>,
    },
    {
      label: "Database",
      value: <Chip color="#22d3ee" bg="rgba(6,182,212,0.12)">PostgreSQL</Chip>,
      label2: "ORM",
      value2: <Chip color="#22d3ee" bg="rgba(6,182,212,0.12)">Prisma 7</Chip>,
    },
    {
      label: "Environment",
      value: <Chip color="#34d399" bg="rgba(16,185,129,0.12)">Production</Chip>,
      label2: "Last Updated",
      value2: (
        <span style={{ fontSize: 13, color: "var(--muted)" }}>March 31, 2026 · 14:22</span>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      <Topbar
        title="Settings"
        subtitle="Application configuration"
        searchPlaceholder="Search settings..."
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stat row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Setting cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {sections.map((s) => (
            <SettingCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── App Info ── */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Section header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--muted)",
              }}
            >
              Application Info
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <ActionBtn>
                <RefreshCw size={13} />
                Check Updates
              </ActionBtn>
              <ActionBtn primary>
                <Download size={13} />
                Export Config
              </ActionBtn>
            </div>
          </div>

          {/* Info table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {infoRows.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: "13px 20px",
                      fontSize: 13,
                      color: "var(--muted)",
                      width: 140,
                      borderBottom:
                        i < infoRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      borderBottom:
                        i < infoRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {row.value}
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      fontSize: 13,
                      color: "var(--muted)",
                      width: 140,
                      borderBottom:
                        i < infoRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {row.label2}
                  </td>
                  <td
                    style={{
                      padding: "13px 20px",
                      borderBottom:
                        i < infoRows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {row.value2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
