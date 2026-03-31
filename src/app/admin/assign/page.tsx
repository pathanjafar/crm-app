"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Users, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/Topbar";

const initialLeads = [
  { id: "L-901", name: "Cyberdyn Systems", email: "info@cyberdyn.io", source: "Meta Ads", priority: "HIGH" },
  { id: "L-902", name: "Initech Corp", email: "bill.l@initech.com", source: "WhatsApp", priority: "MEDIUM" },
  { id: "L-903", name: "Hooli Inc", email: "gavin@hooli.xyz", source: "Direct", priority: "HIGH" },
];

const agents = [
  { id: "A1", name: "Sarah J." },
  { id: "A2", name: "Mike R." },
];

export default function AssignPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const handleConfirm = (leadId: string) => {
    if (!assignments[leadId]) return;
    setConfirmed(prev => ({ ...prev, [leadId]: true }));
    setTimeout(() => {
      setLeads(prev => prev.filter(l => l.id !== leadId));
    }, 600);
  };

  const handleAutoAssign = () => {
    const newAssignments: Record<string, string> = {};
    leads.forEach((lead, i) => {
      newAssignments[lead.id] = agents[i % agents.length].id;
    });
    setAssignments(newAssignments);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Assign Leads"
        subtitle={`${leads.length} unassigned in queue`}
        searchPlaceholder="Search queue..."
        action={{ label: "Auto Assign", icon: <Zap className="w-3.5 h-3.5" />, onClick: handleAutoAssign }}
      />

      <div className="p-6">
        {leads.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-5 text-[13px] text-[var(--muted)]">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{leads.length} lead{leads.length !== 1 ? "s" : ""} pending assignment</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: confirmed[lead.id] ? 0 : 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: confirmed[lead.id] ? 0.3 : 0.3 }}
                  className="card p-5 flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-[13px] font-bold text-indigo-400 flex-shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-[14px] leading-tight">{lead.name}</div>
                        <div className="text-[11px] text-[var(--muted)] mt-0.5">{lead.email}</div>
                      </div>
                    </div>
                    <span className={lead.priority === "HIGH" ? "badge badge-high flex-shrink-0" : "badge badge-medium flex-shrink-0"}>
                      {lead.priority}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[12px] py-3 border-t border-b border-[var(--border)]">
                    <div>
                      <div className="text-[var(--muted)] mb-0.5">Source</div>
                      <div className="font-medium text-[var(--foreground)]">{lead.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--muted)] mb-0.5">Lead ID</div>
                      <div className="font-mono font-medium text-[var(--foreground)]">{lead.id}</div>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wide block">Assign to agent</label>
                    <select
                      value={assignments[lead.id] ?? ""}
                      onChange={(e) => setAssignments(prev => ({ ...prev, [lead.id]: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg text-[13px] font-medium text-white bg-[var(--surface-2)] border border-[var(--border)] outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all appearance-none"
                    >
                      <option value="" className="bg-[#0a0f1e]">Select agent...</option>
                      {agents.map(a => (
                        <option key={a.id} value={a.id} className="bg-[#0a0f1e]">{a.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleConfirm(lead.id)}
                      disabled={!assignments[lead.id]}
                      className="btn-primary w-full h-9 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Confirm Assignment <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-16 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-white">Queue Clear</h3>
              <p className="text-[13px] text-[var(--muted)] mt-1">All leads have been assigned to agents.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}