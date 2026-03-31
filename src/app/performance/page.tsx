"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Users, Zap, PhoneOutgoing, Trophy, Mail, TrendingUp, Star } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { getPerformanceAction } from "@/app/actions/performance";

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadStats() {
      const res = await getPerformanceAction();
      setData(res);
      setLoading(false);
    }
    loadStats();
  }, []);

  const filtered = (data?.agents || []).filter((a: any) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle: Record<string, React.CSSProperties> = {
    CONVERTED: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" },
    INTERESTED: { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)" },
    CONTACTED: { background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" },
    NEW: { background: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.25)" },
  };

  const IconMap = { Activity, Users, Zap, PhoneOutgoing };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", minHeight: "100vh", background: "var(--background)" }}>
        Loading Performance...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="Performance"
        subtitle="Real-time agent leaderboard"
        searchPlaceholder="Search agents..."
        onSearch={setSearch}
        action={{ label: "Export CSV" }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Team Stats ── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {data?.teamStats.map((s: any, i: number) => {
            const Icon: any = IconMap[s.icon as keyof typeof IconMap] || Activity;
            return (
                <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}
                >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{s.label}</span>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 14, height: 14, color: "#818cf8" }} />
                    </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.delta}</div>
                </motion.div>
            );
          })}
        </section>

        {/* ── Agent Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.length === 0 ? (
            <Card style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No agents found in database.</Card>
          ) : filtered.map((agent: any, i: number) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}
            >
              {/* Agent Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "2px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#818cf8", flexShrink: 0 }}>
                  {agent.name[0]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{agent.name}</h3>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{agent.email}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                     {agent._count.leads} active leads unassigned
                  </div>
                </div>

                {/* KPI chips */}
                <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                  {[
                    { label: "Revenue", value: `₹${(agent.revenue || 0).toLocaleString()}`, color: "#fff" },
                    { label: "Conv. Rate", value: `${(agent.conversionRate || 0).toFixed(1)}%`, color: "#818cf8" },
                    { label: "Leads", value: agent._count.leads.toString(), color: "#fff" },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leads sub-table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                   <thead style={{ background: "rgba(255,255,255,0.02)" }}>
                      <tr>
                         <th style={thStyle}>Assigned Lead</th>
                         <th style={thStyle}>Status</th>
                         <th style={thStyle}>Priority</th>
                      </tr>
                   </thead>
                  <tbody>
                    {agent.leads.length === 0 ? (
                       <tr><td colSpan={3} style={{ padding: 12, textAlign: "center", fontSize: 11, color: "var(--muted)" }}>No lead activity recorded.</td></tr>
                    ) : agent.leads.slice(0, 3).map((lead: any, j: number) => (
                      <tr key={j} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{lead.name}</td>
                        <td style={{ padding: "10px 24px" }}>
                            <span style={{ ...statusStyle[lead.status], fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{lead.status}</span>
                        </td>
                        <td style={{ padding: "10px 24px", fontSize: 12, color: lead.priority === "HIGH" ? "#ef4444" : "var(--muted)" }}>{lead.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>
);

const thStyle: React.CSSProperties = {
  padding: "10px 24px", fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left"
};