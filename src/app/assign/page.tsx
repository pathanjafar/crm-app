"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, AlertCircle, ChevronRight, Users, Clock, ListChecks } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { getAssignDataAction, assignLeadAction } from "@/app/actions/assign";

export default function AssignPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    setLoading(true);
    const res = await getAssignDataAction();
    setLeads(res.leads);
    setAgents(res.agents);
    setLoading(false);
  }

  const handleConfirm = async (leadId: string) => {
    const agentId = assignments[leadId];
    if (!agentId) return;

    setConfirmed(prev => ({ ...prev, [leadId]: true }));
    const res = await assignLeadAction(leadId, agentId);
    if (res.success) {
      setTimeout(() => {
        setLeads(prev => prev.filter(l => l.id !== leadId));
      }, 500);
    } else {
        alert(res.error);
        setConfirmed(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const priorityStyle: Record<string, React.CSSProperties> = {
    HIGH: { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
    MEDIUM: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" },
    LOW: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" },
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", minHeight: "100vh", background: "var(--background)" }}>Loading queue...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="Assign Leads"
        subtitle={`${leads.length} unassigned in database queue`}
        searchPlaceholder="Search real-time queue..."
        action={{ label: "Refresh Data", onClick: refreshData }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Summary strip ── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "In Database Queue", value: leads.length.toString(), icon: ListChecks, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
            { label: "Pending Today", value: Object.values(assignments).filter(Boolean).length.toString(), icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
            { label: "Active CRM Agents", value: agents.length.toString(), icon: Users, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon style={{ width: 20, height: 20, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

          {/* ── Lead Queue ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <AnimatePresence>
              {leads.length > 0 ? leads.map((lead, i) => {
                const isConfirmed = confirmed[lead.id];

                return (
                  <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: isConfirmed ? 0 : 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.35 }} style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#818cf8" }}>{lead.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{lead.name}</span>
                          <span style={{ ...priorityStyle[lead.priority], fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{lead.priority}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{lead.email || "No email"}</div>
                        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                          {[
                            { label: "Database ID", value: lead.id.slice(0, 8), valueSx: { fontFamily: "monospace" } },
                            { label: "Source", value: lead.source },
                            { label: "Created", value: new Date(lead.createdAt).toLocaleDateString() },
                          ].map(m => (
                            <div key={m.label}>
                              <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>{m.label}</div>
                              <div style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 600, ...m.valueSx }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
                        <select value={assignments[lead.id] ?? ""} onChange={e => setAssignments(prev => ({ ...prev, [lead.id]: e.target.value }))} style={{ height: 36, padding: "0 12px", borderRadius: 9, fontSize: 13, background: "var(--surface-2)", border: "1px solid var(--border)", color: "#fff", outline: "none", cursor: "pointer" }}>
                          <option value="">Select agent...</option>
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <button onClick={() => handleConfirm(lead.id)} disabled={!assignments[lead.id]} style={{ height: 36, borderRadius: 9, border: "none", background: assignments[lead.id] ? "#6366f1" : "var(--surface-3)", color: assignments[lead.id] ? "#fff" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          Confirm Assignment <ChevronRight style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: "40px", textAlign: "center", color: "var(--muted)" }}>The real database queue is currently clear!</div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Agent Sidebar ── */}
          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", marginBottom: 16 }}>Agent Load Balance</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
               {agents.map(agent => (
                 <div key={agent.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                       <span style={{ color: "#fff", fontWeight: 600 }}>{agent.name}</span>
                       <span style={{ color: "var(--muted)" }}>{agent._count.leads} active</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "var(--surface-3)" }}>
                       <div style={{ height: "100%", borderRadius: 99, background: "#6366f1", width: `${Math.min(100, (agent._count.leads / 20) * 100)}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}