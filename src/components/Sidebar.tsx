"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "AGENT"] },
  { href: "/leads", label: "Leads", icon: Users, roles: ["ADMIN", "AGENT"] },
  { href: "/sales", label: "Sales", icon: DollarSign, roles: ["ADMIN"] },
  { href: "/products", label: "Products", icon: ShoppingBag, roles: ["ADMIN"] },
  { href: "/performance", label: "Performance", icon: TrendingUp, roles: ["ADMIN"] },
  { href: "/agents", label: "Agents", icon: UserCog, roles: ["ADMIN"] },
  { href: "/assign", label: "Assign", icon: UserCheck, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/login") return null;

  const role = (session?.user as any)?.role || "AGENT";
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside
      style={{
        width: collapsed ? 68 : 232,
        background: "#0c0c0e",
        borderRight: "1px solid #1f1f23",
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
          borderBottom: "1px solid #1f1f23",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap style={{ width: 14, height: 14, color: "#818cf8" }} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              CRM <span style={{ color: "#6366f1", fontSize: 10, marginLeft: 4, fontWeight: 600 }}>PRO</span>
            </span>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#18181b",
            border: "1px solid #27272a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#71717a",
          }}
        >
          <ChevronLeft style={{ width: 12, height: 12, transform: collapsed ? "rotate(180deg)" : "none" }} />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {filteredNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px 0" : "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "rgba(99,102,241,0.1)" : "transparent",
                color: active ? "#818cf8" : "#71717a",
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                transition: "all 0.2s",
                border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{ padding: "12px", borderTop: "1px solid #1f1f23" }}>
         <button
          onClick={() => signOut()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: collapsed ? "10px 0" : "10px 12px",
            background: "none",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#f87171",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && session?.user && (
          <div style={{ marginTop: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, background: "#18181b", borderRadius: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.name}</p>
              <p style={{ fontSize: 10, color: "#71717a", textTransform: "capitalize" }}>{role.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}