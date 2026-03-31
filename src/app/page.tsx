"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Trophy, 
  CheckCircle2, 
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { DashboardCharts } from "@/components/DashboardCharts";
import { getDashboardStatsAction } from "@/app/actions/dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStatsAction();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh", background: "var(--background)", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading Dashboard...</p>
      </div>
    );
  }

  const metrics = [
    {
      label: "TOTAL LEADS", value: stats?.totalLeads || 0, delta: "Real-time", deltaLabel: "from database",
      positive: true, icon: Users,
      iconBg: "rgba(99,102,241,0.15)", iconColor: "#818cf8",
      sparkColor: "#6366f1",
      spark: stats?.leadSpark || [0,0,0,0,0,0,0],
    },
    {
      label: "ACTIVE DEALS", value: stats?.activeLeads || 0, delta: "Active", deltaLabel: "in pipeline",
      positive: true, icon: DollarSign,
      iconBg: "rgba(6,182,212,0.15)", iconColor: "#22d3ee",
      sparkColor: "#06b6d4",
      spark: stats?.leadSpark?.map((v: number) => v * 0.6) || [0,0,0,0,0,0,0],
    },
    {
      label: "REVENUE (PAID)", value: `₹${(stats?.revenue || 0).toLocaleString()}`, delta: "Total", deltaLabel: "verified sales",
      positive: true, icon: TrendingUp,
      iconBg: "rgba(16,185,129,0.15)", iconColor: "#34d399",
      sparkColor: "#10b981",
      spark: stats?.saleSpark || [0,0,0,0,0,0,0],
    },
    {
      label: "CONV. RATE", value: `${(stats?.conversionRate || 0).toFixed(1)}%`, delta: "Avg.", deltaLabel: "efficiency",
      positive: true, icon: Trophy,
      iconBg: "rgba(245,158,11,0.15)", iconColor: "#fbbf24",
      sparkColor: "#f59e0b",
      spark: stats?.leadSpark?.map((v: number, i: number) => (v > 0 ? (stats.saleSpark?.[i] > 0 ? (1/v) * 100 : 0) : 0)) || [0,0,0,0,0,0,0],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, background: "var(--background)" }}>
      <Topbar
        title="Dashboard"
        subtitle="Real-time sales performance"
        searchPlaceholder="Search leads, deals..."
        action={{ label: "New Lead", onClick: () => window.location.href = "/leads" }}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Metrics Grid */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card style={{ padding: "20px 22px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em" }}>{m.label}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <m.icon style={{ width: 14, height: 14, color: m.iconColor }} />
                  </div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{m.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: m.positive ? "#10b981" : "#ef4444" }}>{m.delta}</span>
                  <span style={{ color: "var(--muted)" }}>{m.deltaLabel}</span>
                </div>
                <div style={{ marginTop: 14 }}><Sparkline data={m.spark} color={m.sparkColor} /></div>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Real Charts Segment */}
        <section>
          <DashboardCharts 
            revenueTrend={stats?.revenueTrend || []} 
            pieData={stats?.pieData || []} 
            totalRevenue={stats?.revenue || 0}
          />
        </section>

        {/* Funnel + Goals */}
        <section style={{ 
          display: "grid", 
          gridTemplateColumns: (stats?.totalLeads > 0) ? "1fr" : "1fr 1fr", 
          gap: 16 
        }}>
          <Card style={{ padding: "20px 24px" }}>
             <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Conversion Funnel</p>
             <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>Lead stages from database</p>
             <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {stats?.funnel.map((f: any) => (
                  <div key={f.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{f.value}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "var(--surface-3)" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: f.color, width: stats.totalLeads > 0 ? `${(f.value / stats.totalLeads) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
             </div>
          </Card>

          {stats?.totalLeads === 0 && (
            <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
               <CheckCircle2 style={{ width: 44, height: 44, color: "#10b981", marginBottom: 14 }} />
               <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Ready for Original Data</h3>
               <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.5, maxWidth: 300 }}>
                  All mock data has been removed. You can now start adding your leads and products manually or via CSV.
               </p>
            </Card>
          )}
        </section>

      </div>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>
);

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 100, H = 38;
  const min = Math.min(...data), max = Math.max(...data);
  const rng = (max - min) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / rng) * (H - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 38, display: "block" }} preserveAspectRatio="none">
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}