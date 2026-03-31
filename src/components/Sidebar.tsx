"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Settings,
  ChevronLeft,
  Zap,
  ShoppingBag,
  UserCog,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/sales", label: "Sales", icon: DollarSign },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/agents", label: "Agents", icon: UserCog },
  { href: "/assign", label: "Assign", icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 68 : 232,
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* ── Logo row ── */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: collapsed ? "0 18px" : "0 16px 0 18px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(99,102,241,0.25)",
              border: "1px solid rgba(99,102,241,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap style={{ width: 16, height: 16, color: "#818cf8" }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              CRM
            </span>
          )}
        </div>

        {/* Collapse button */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft style={{ width: 13, height: 13, color: "var(--muted)" }} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft
              style={{
                width: 13,
                height: 13,
                color: "var(--muted)",
                transform: "rotate(180deg)",
              }}
            />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "16px 10px" : "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "#6366f1" : "transparent",
                color: active ? "#fff" : "var(--muted)",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                boxShadow: active ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--surface-3)";
                  e.currentTarget.style.color = "var(--foreground)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--muted)";
                }
              }}
            >
              <Icon
                style={{
                  width: 17,
                  height: 17,
                  flexShrink: 0,
                  color: active ? "#fff" : "inherit",
                }}
              />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          padding: collapsed ? "12px 10px" : "12px",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "9px 0" : "9px 12px",
            borderRadius: 10,
            textDecoration: "none",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "var(--muted)",
            fontWeight: 500,
            fontSize: 14,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          <Settings style={{ width: 17, height: 17, flexShrink: 0 }} />
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              AD
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Admin
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginTop: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                admin@company.com
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}