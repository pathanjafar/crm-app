"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DownloadCloud, TrendingUp, CreditCard, CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { getSalesAction } from "@/app/actions/sales";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    refreshSales();
  }, []);

  async function refreshSales() {
    setLoading(true);
    const data = await getSalesAction();
    setSales(data);
    setLoading(false);
  }

  const filtered = sales.filter(s =>
    (s.lead?.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.product?.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const statusStyle: Record<string, any> = {
    PAID: { background: "rgba(16,185,129,0.12)", color: "#34d399" },
    PENDING: { background: "rgba(245,158,11,0.12)", color: "#fbbf24" },
    REFUNDED: { background: "rgba(239,68,68,0.12)", color: "#f87171" }, // Matches SaleStatus enum
  };

  const StatusIcon = { PAID: CheckCircle2, PENDING: Clock, REFUNDED: XCircle };

  const totalRevenue = sales.filter(s => s.status === "PAID").reduce((acc, s) => acc + Number(s.amount), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="Sales"
        subtitle="Real financial ledger records"
        searchPlaceholder="Search invoices, leads, or products..."
        onSearch={setSearch}
        action={{ label: "Export CSV" }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Revenue Summary */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Net Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
            { label: "Paid Invoices", value: sales.filter(s => s.status === "PAID").length.toString(), icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
            { label: "Pending", value: sales.filter(s => s.status === "PENDING").length.toString(), icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
            { label: "Refunded", value: sales.filter(s => s.status === "REFUNDED").length.toString(), icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
          ].map((m, i) => (
             <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
               <Card style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{m.label}</span>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <m.icon style={{ width: 16, height: 16, color: m.color }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{m.value}</div>
               </Card>
             </motion.div>
          ))}
        </section>

        {/* Transactions Table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Verified Transactions</h2>
             <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtered.length} records</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Invoice", "Product", "Amount", "Status", "Agent"].map(col => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading sales data...</td></tr>
                ) : filtered.length === 0 ? (
                   <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No transaction records found in the database.</td></tr>
                ) : (
                  filtered.map((sale, i) => {
                    const Icon = StatusIcon[sale.status as keyof typeof StatusIcon] || CheckCircle2;
                    return (
                      <tr key={sale.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={tdStyle}>
                           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontStyle: "italic", color: "var(--muted)" }}>#</div>
                              <div>
                                 <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{sale.lead?.name || "Unknown Lead"}</div>
                                 <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>{sale.id.slice(0, 8)}...</div>
                              </div>
                           </div>
                        </td>
                        <td style={tdStyle}>
                           <div style={{ fontSize: 13, color: "var(--foreground)" }}>{sale.product?.name || "Generic Product"}</div>
                           <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sale.paymentMethod || "Direct Payment"}</div>
                        </td>
                        <td style={tdStyle}>
                           <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>₹{Number(sale.amount).toLocaleString()}</div>
                        </td>
                        <td style={tdStyle}>
                           <span style={{ ...statusStyle[sale.status], fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <Icon style={{ width: 11, height: 11 }} />
                              {sale.status}
                           </span>
                        </td>
                        <td style={tdStyle}>
                           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                             <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                                {sale.agent?.name[0] || "?"}
                             </div>
                             <span style={{ fontSize: 13, color: "var(--foreground)" }}>{sale.agent?.name || "System"}</span>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>
);

const thStyle: React.CSSProperties = {
  padding: "12px 20px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", background: "var(--surface-1)", borderBottom: "1px solid var(--border)"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 20px", borderBottom: "1px solid var(--border)"
};