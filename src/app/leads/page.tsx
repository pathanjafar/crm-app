"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, ShieldCheck, Zap, Target, Mail, Search, Filter, Upload, Edit, X, Save, Trash2 } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { getLeadsAction, bulkImportLeadsAction, createLeadAction, updateLeadAction, deleteLeadAction } from "@/app/actions/leads";
import Papa from "papaparse";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    refreshLeads();
  }, []);

  async function refreshLeads() {
    setLoading(true);
    const data = await getLeadsAction();
    setLeads(data);
    setLoading(false);
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
    (l.phone && l.phone.includes(search))
  );

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const res = await bulkImportLeadsAction(results.data);
        if (res.success) {
          alert(`Successfully imported ${res.count} leads!`);
          refreshLeads();
        } else {
          alert(res.error || "Failed to import leads. Check your CSV format.");
        }
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
        setImporting(false);
      }
    });
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const statusStyle: Record<string, any> = {
    NEW: { background: "rgba(6,182,212,0.12)", color: "#22d3ee" },
    CONTACTED: { background: "rgba(139,92,246,0.12)", color: "#a78bfa" },
    INTERESTED: { background: "rgba(245,158,11,0.12)", color: "#fbbf24" },
    CONVERTED: { background: "rgba(16,185,129,0.12)", color: "#34d399" },
    LOST: { background: "rgba(239,68,68,0.12)", color: "#f87171" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="Leads"
        subtitle={`${leads.length} prospects in database`}
        searchPlaceholder="Search leads..."
        onSearch={setSearch}
        action={{ 
          label: "Add Lead", 
          onClick: () => {
            setEditingLead(null);
            setIsModalOpen(true);
          }
        }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Import Action */}
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            style={{ 
              height: 38, padding: "0 18px", borderRadius: 10, 
              background: "var(--surface-2)", border: "1px solid var(--border)", 
              color: "var(--foreground)", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
            }}
          >
            <Upload style={{ width: 14, height: 14 }} />
            {importing ? "Importing..." : "Bulk Import CSV"}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleCsvUpload} accept=".csv" style={{ display: "none" }} />
        </div>

        {/* Table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Real Lead Database</h2>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtered.length} results</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Name", "Contact", "Source", "Status", "Priority", "Agent", "Actions"].map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading leads...</td></tr>
                ) : filtered.length === 0 ? (
                   <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No real leads found. Import a CSV to populate your CRM.</td></tr>
                ) : (
                  filtered.map((lead, i) => (
                    <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)" }} className="table-row-hover">
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>
                            {lead.name[0]}
                          </div>
                          <span style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{lead.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, color: "var(--foreground)" }}>{lead.phone || "No phone"}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{lead.email || "No email"}</div>
                      </td>
                      <td style={tdStyle}>
                         <span style={{ fontSize: 12, color: "var(--muted)" }}>{lead.source}</span>
                      </td>
                      <td style={tdStyle}>
                         <span style={{ ...statusStyle[lead.status], fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                            {lead.status}
                         </span>
                      </td>
                      <td style={tdStyle}>
                         <span style={{ 
                            fontSize: 10, fontWeight: 700, color: lead.priority === "HIGH" ? "#ef4444" : lead.priority === "MEDIUM" ? "#f59e0b" : "#10b981"
                         }}>
                            {lead.priority}
                         </span>
                      </td>
                      <td style={tdStyle}>
                         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                               {lead.agent?.name[0] || "?"}
                            </div>
                            <span style={{ fontSize: 12, color: "var(--foreground)" }}>{lead.agent?.name || "Unassigned"}</span>
                         </div>
                      </td>
                      <td style={tdStyle}>
                         <div style={{ display: "flex", gap: 4 }}>
                           <button 
                             onClick={() => handleEdit(lead)}
                             style={{ 
                                background: "none", border: "none", cursor: "pointer", 
                                color: "var(--muted)", padding: 6, borderRadius: 6, 
                                transition: "all 0.2s"
                             }}
                             onMouseEnter={e => e.currentTarget.style.color = "#818cf8"}
                             onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                           >
                             <Edit style={{ width: 16, height: 16 }} />
                           </button>
                           <button 
                             onClick={async () => {
                               if (!confirm(`Delete lead "${lead.name}"?`)) return;
                               const res = await deleteLeadAction(lead.id);
                               if (res.success) refreshLeads();
                               else alert(res.error);
                             }}
                             style={{ 
                                background: "none", border: "none", cursor: "pointer", 
                                color: "var(--muted)", padding: 6, borderRadius: 6, 
                                transition: "all 0.2s"
                             }}
                             onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                             onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                           >
                             <Trash2 style={{ width: 16, height: 16 }} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={editingLead}
        onSave={() => {
            setIsModalOpen(false);
            refreshLeads();
        }}
      />
    </div>
  );
}

function LeadModal({ isOpen, onClose, lead, onSave }: any) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const res = lead 
      ? await updateLeadAction(lead.id, formData)
      : await createLeadAction(formData);

    if (res.success) {
      onSave();
    } else {
      alert(res.error);
    }
    setIsSaving(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={modalOverlayStyle}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={modalContentStyle}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{lead ? "Edit Lead" : "Add New Lead"}</h3>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                    <X style={{ width: 20, height: 20 }} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={rowStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Full Name</label>
                        <input name="name" defaultValue={lead?.name} placeholder="e.g. John Doe" style={inputStyle} required />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <input name="email" type="email" defaultValue={lead?.email} placeholder="john@example.com" style={inputStyle} />
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Phone Number</label>
                        <input name="phone" defaultValue={lead?.phone} placeholder="98XXXXXXXX" style={inputStyle} />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Source</label>
                        <select name="source" defaultValue={lead?.source || "ORGANIC"} style={inputStyle}>
                            {["ORGANIC", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "META_ADS"].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={rowStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Status</label>
                        <select name="status" defaultValue={lead?.status || "NEW"} style={inputStyle}>
                            {["NEW", "CONTACTED", "INTERESTED", "CONVERTED", "LOST"].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Priority</label>
                        <select name="priority" defaultValue={lead?.priority || "MEDIUM"} style={inputStyle}>
                           {["LOW", "MEDIUM", "HIGH"].map(p => (
                                <option key={p} value={p}>{p}</option>
                           ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 10, border: "1px solid var(--border)", background: "none", color: "#fff", fontWeight: 600 }}>Cancel</button>
                    <button type="submit" disabled={isSaving} style={{ flex: 1, height: 44, borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, border: "none" }}>
                        {isSaving ? "Saving..." : "Save Lead"}
                    </button>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>
);

const thStyle: React.CSSProperties = {
  padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", background: "var(--surface-1)", borderBottom: "1px solid var(--border)"
};

const tdStyle: React.CSSProperties = {
  padding: "14px 20px", borderBottom: "1px solid var(--border)"
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
};

const modalContentStyle: React.CSSProperties = {
  background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 20, width: "100%", maxWidth: 600, padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
};

const inputGroupStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, flex: 1 };
const rowStyle: React.CSSProperties = { display: "flex", gap: 16 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" };
const inputStyle: React.CSSProperties = {
  height: 42, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px", color: "#fff", fontSize: 14, outline: "none"
};