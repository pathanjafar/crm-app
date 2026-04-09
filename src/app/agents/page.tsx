"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCog, Edit, Trash2, X, Shield, Users, Plus,
  DollarSign, CheckCircle, Clock, RefreshCw, Package
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { 
  getUsersAction, createUserAction, updateUserAction, deleteUserAction,
  getSalesForAdminAction, updateSaleStatusAction,
  getProductsForSelectAction, updateSaleAction,
  getLeadsForSelectAction, createSaleAction
} from "@/app/actions/users";

// ── Types ────────────────────────────────────────────────
type User   = { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string; totalLeads: number; totalSales: number; totalCalls: number; revenue: number; };
type Sale    = { id: string; amount: number; status: string; paymentMethod: string | null; createdAt: string; lead: { id: string; name: string; phone: string | null; email: string | null }; agent: { id: string; name: string }; product: { id: string; name: string }; };
type Product = { id: string; name: string; price: number; currency: string };
type Lead    = { id: string; name: string; phone: string | null; email: string | null };

// ── Main Page ────────────────────────────────────────────
export default function AgentsPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [sales,    setSales]    = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "sales">("users");

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser,     setEditingUser]     = useState<User | null>(null);
  const [isSaleModalOpen,  setIsSaleModalOpen]  = useState(false);
  const [editingSale,      setEditingSale]      = useState<Sale | null>(null);  // null = create mode

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    const [u, s, p, l] = await Promise.all([
      getUsersAction(),
      getSalesForAdminAction(),
      getProductsForSelectAction(),
      getLeadsForSelectAction(),
    ]);
    setUsers(u);
    setSales(s);
    setProducts(p as Product[]);
    setLeads(l as Lead[]);
    setLoading(false);
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    const res = await deleteUserAction(user.id);
    if (res.success) refresh(); else alert(res.error);
  }

  async function handleStatusChange(saleId: string, status: string) {
    await updateSaleStatusAction(saleId, status);
    refresh();
  }

  const statusStyle: Record<string, { bg: string; color: string; icon: any }> = {
    PAID:     { bg: "rgba(16,185,129,0.12)",  color: "#34d399", icon: CheckCircle },
    PENDING:  { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", icon: Clock },
    REFUNDED: { bg: "rgba(239,68,68,0.12)",   color: "#f87171", icon: RefreshCw },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="User Management"
        subtitle="Admin control panel · users & sales"
        searchPlaceholder="Search users..."
        action={{ label: "Add User", onClick: () => { setEditingUser(null); setIsUserModalOpen(true); } }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stats */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total Users",  value: users.length,  icon: UserCog,    color: "#818cf8", bg: "rgba(99,102,241,0.12)" },
            { label: "Sales Agents",  value: users.filter(a => a.role === "AGENT").length, icon: Users, color: "#22d3ee", bg: "rgba(6,182,212,0.12)" },
            { label: "Total Sales",   value: sales.length,   icon: DollarSign, color: "#34d399", bg: "rgba(16,185,129,0.12)" },
            { label: "Paid Revenue",  value: `₹${sales.filter(s => s.status === "PAID").reduce((sum, s) => sum + s.amount, 0).toLocaleString()}`, icon: DollarSign, color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
          ].map(stat => (
            <Card key={stat.label} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{stat.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon style={{ width: 14, height: 14, color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{loading ? "—" : stat.value}</div>
            </Card>
          ))}
        </section>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {(["users", "sales"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600, textTransform: "capitalize",
                color: activeTab === tab ? "#818cf8" : "var(--muted)",
                borderBottom: activeTab === tab ? "2px solid #818cf8" : "2px solid transparent",
                transition: "all 0.15s"
              }}>
                {tab === "users" ? `Users (${users.length})` : `Sales & Status (${sales.length})`}
              </button>
            ))}
          </div>

          {activeTab === "sales" && (
            <button
              onClick={() => { setEditingSale(null); setIsSaleModalOpen(true); }}
              style={{
                height: 36, padding: "0 16px", borderRadius: 9, marginBottom: 8,
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer"
              }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Add Sale
            </button>
          )}
        </div>

        {/* ── Users Tab ── */}
        {activeTab === "users" && (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>{["User", "Contact", "Role", "Leads", "Sales", "Revenue", "Actions"].map(c => (
                  <th key={c} style={thStyle}>{c}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={emptyCell}>Loading users…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} style={emptyCell}>No users yet. Click "Add User".</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <AvatarBadge name={user.name} isAdmin={user.role === "ADMIN"} />
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{user.name}</p>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 12, color: "var(--foreground)" }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{user.phone || "No phone"}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: user.role === "ADMIN" ? "rgba(245,158,11,0.12)" : "rgba(99,102,241,0.12)", color: user.role === "ADMIN" ? "#fbbf24" : "#818cf8" }}>
                        {user.role === "ADMIN" && <Shield style={{ width: 9, height: 9, display: "inline", marginRight: 4 }} />}{user.role}
                      </span>
                    </td>
                    <td style={tdStyle}><b style={{ color: "#fff" }}>{user.totalLeads}</b></td>
                    <td style={tdStyle}><b style={{ color: "#fff" }}>{user.totalSales}</b></td>
                    <td style={tdStyle}><b style={{ color: "#34d399" }}>₹{user.revenue.toLocaleString()}</b></td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} color="#818cf8" title="Edit"><Edit style={{ width: 14, height: 14 }} /></Btn>
                        <Btn onClick={() => handleDeleteUser(user)} color="#f87171" title="Delete"><Trash2 style={{ width: 14, height: 14 }} /></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* ── Sales Tab ── */}
        {activeTab === "sales" && (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>{["Lead", "Product", "User", "Amount", "Status", "Payment", "Date", "Actions"].map(c => (
                  <th key={c} style={thStyle}>{c}</th>
                ))}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={emptyCell}>Loading sales…</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...emptyCell, paddingTop: 60, paddingBottom: 60 }}>
                    <DollarSign style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.2 }} />
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>No sales yet</p>
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>Click <b style={{ color: "#34d399" }}>+ Add Sale</b> to log your first sale.</p>
                  </td></tr>
                ) : sales.map(sale => {
                  const si = statusStyle[sale.status] || statusStyle.PENDING;
                  return (
                    <tr key={sale.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={tdStyle}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{sale.lead.name}</p>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sale.lead.phone || sale.lead.email || "—"}</p>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Package style={{ width: 13, height: 13, color: "var(--muted)", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "var(--foreground)" }}>{sale.product.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{sale.agent.name[0]}</div>
                          <span style={{ fontSize: 12, color: "var(--foreground)" }}>{sale.agent.name}</span>
                        </div>
                      </td>
                      <td style={tdStyle}><b style={{ fontSize: 14, color: "#34d399" }}>₹{sale.amount.toLocaleString()}</b></td>
                      <td style={tdStyle}>
                        <select value={sale.status} onChange={e => handleStatusChange(sale.id, e.target.value)}
                          style={{ background: si.bg, border: `1px solid ${si.color}40`, borderRadius: 8, color: si.color, fontSize: 11, fontWeight: 700, padding: "4px 8px", cursor: "pointer", outline: "none" }}>
                          {["PAID", "PENDING", "REFUNDED"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "var(--muted)" }}>{sale.paymentMethod || "—"}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(sale.createdAt).toLocaleDateString("en-IN")}</span></td>
                      <td style={tdStyle}>
                        <Btn onClick={() => { setEditingSale(sale); setIsSaleModalOpen(true); }} color="#818cf8" title="Edit Sale">
                          <Edit style={{ width: 14, height: 14 }} />
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} user={editingUser} onSave={() => { setIsUserModalOpen(false); refresh(); }} />
      <SaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} sale={editingSale} products={products} users={users} leads={leads} onSave={() => { setIsSaleModalOpen(false); refresh(); }} />
    </div>
  );
}

// ── Sale Modal ───────────────────────────────────────────
function SaleModal({ isOpen, onClose, sale, products, users, leads, onSave }: {
  isOpen: boolean; onClose: () => void; sale: Sale | null;
  products: Product[]; users: User[]; leads: Lead[]; onSave: () => void;
}) {
  const isEdit = !!sale;
  const [isSaving,  setIsSaving]  = useState(false);
  const [productId, setProductId] = useState("");
  const [amount,    setAmount]    = useState("");

  useEffect(() => {
    if (sale) { setProductId(sale.product.id); setAmount(String(sale.amount)); }
    else       { setProductId(""); setAmount(""); }
  }, [sale, isOpen]);

  function handleProductChange(pid: string) {
    setProductId(pid);
    const p = products.find(p => p.id === pid);
    if (p && p.price > 0) setAmount(String(p.price));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = isEdit ? await updateSaleAction(sale!.id, fd) : await createSaleAction(fd);
    if (res.success) onSave(); else alert(res.error);
    setIsSaving(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 20, width: "100%", maxWidth: 580, padding: 32, boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign style={{ width: 18, height: 18, color: "#34d399" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{isEdit ? "Edit Sale" : "Add New Sale"}</h3>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X style={{ width: 20, height: 20 }} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!isEdit && (
                <Field label="Select Lead *">
                  <select name="leadId" style={iStyle} required defaultValue="">
                    <option value="" disabled>Choose a lead…</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </Field>
              )}
              {!isEdit && (
                <Field label="Assigned User *">
                  <select name="userId" style={iStyle} required defaultValue="">
                    <option value="" disabled>Choose a user…</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Product *">
                <select name="productId" value={productId} onChange={e => handleProductChange(e.target.value)} style={iStyle} required>
                  <option value="" disabled>Choose a product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Amount (₹) *"><input name="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={iStyle} required /></Field>
                <Field label="Status">
                   <select name="status" defaultValue={sale?.status || "PAID"} style={iStyle}>
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                   </select>
                </Field>
              </div>
              <button type="submit" disabled={isSaving} style={{ height: 44, borderRadius: 10, background: "#10b981", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
                {isSaving ? "Saving…" : "Save"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── User Modal ───────────────────────────────────────────
function UserModal({ isOpen, onClose, user, onSave }: { isOpen: boolean; onClose: () => void; user: User | null; onSave: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = user ? await updateUserAction(user.id, fd) : await createUserAction(fd);
    if (res.success) onSave(); else alert(res.error);
    setIsSaving(false);
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 20, width: "100%", maxWidth: 520, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{user ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Name"><input name="name" defaultValue={user?.name} style={iStyle} required /></Field>
              <Field label="Email"><input name="email" defaultValue={user?.email} style={iStyle} required /></Field>
              <Field label="Password"><input name="password" type="password" placeholder="Leave blank to keep same" style={iStyle} /></Field>
              <Field label="Role">
                <select name="role" defaultValue={user?.role || "AGENT"} style={iStyle}>
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </Field>
              <button type="submit" disabled={isSaving} style={{ height: 44, borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
                {isSaving ? "Saving…" : "Save"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>{label}</label>{children}</div>;
}

function AvatarBadge({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  return <div style={{ width: 36, height: 36, borderRadius: 10, background: isAdmin ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isAdmin ? "#fbbf24" : "#818cf8" }}>{name[0].toUpperCase()}</div>;
}

function Btn({ children, onClick, color, title }: any) {
  return <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>{children}</button>;
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>;
const thStyle: React.CSSProperties   = { padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", textAlign: "left", background: "var(--surface-1)", borderBottom: "1px solid var(--border)" };
const tdStyle: React.CSSProperties   = { padding: "14px 20px", borderBottom: "1px solid var(--border)" };
const emptyCell: React.CSSProperties = { padding: 40, textAlign: "center", color: "var(--muted)" };
const iStyle: React.CSSProperties    = { height: 42, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px", color: "#fff", fontSize: 14, outline: "none", width: "100%" };
