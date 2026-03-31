"use client";

import React, { useState } from "react";
import { Search, Bell, Filter, Plus } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
}

export function Topbar({
  title,
  subtitle,
  action,
  searchPlaceholder = "Search...",
  onSearch,
}: TopbarProps) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        background: "var(--surface-1)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div style={{ flexShrink: 0 }}>
        <h1
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "1px 0 0", lineHeight: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search – centred, grows */}
      <div style={{ flex: 1, maxWidth: 380, margin: "0 auto", position: "relative" }}>
        <Search
          style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            width: 13, height: 13, color: "var(--muted)", pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={q}
          onChange={e => { setQ(e.target.value); onSearch?.(e.target.value); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={searchPlaceholder}
          style={{
            width: "100%",
            height: 34,
            paddingLeft: 32,
            paddingRight: 12,
            borderRadius: 8,
            background: "var(--surface-2)",
            border: `1px solid ${focused ? "rgba(99,102,241,0.45)" : "var(--border)"}`,
            color: "var(--foreground)",
            fontSize: 13,
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Filter */}
        <button
          style={{
            height: 34,
            padding: "0 13px",
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            fontSize: 13,
            fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6,
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "var(--foreground)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <Filter style={{ width: 13, height: 13 }} />
          Filter
        </button>

        {/* Bell */}
        <button
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
            color: "var(--muted)",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "var(--foreground)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <Bell style={{ width: 15, height: 15 }} />
          <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
        </button>

        {/* Primary action */}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 8,
              background: "#6366f1",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
              transition: "background 0.15s, box-shadow 0.15s, transform 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#818cf8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#6366f1"; }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {action.icon || <Plus style={{ width: 13, height: 13 }} />}
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}