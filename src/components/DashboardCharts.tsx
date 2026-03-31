"use client";

import React from "react";
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";

interface DashboardChartsProps {
  revenueTrend: { name: string; value: number }[];
  pieData: { name: string; value: number; color: string }[];
  totalRevenue: number;
}

export function DashboardCharts({ revenueTrend, pieData, totalRevenue }: DashboardChartsProps) {
  // Fallback for empty data to keep the UI looking good even with 0 records
  const displayRevenueTrend = revenueTrend.length > 0 ? revenueTrend : [
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
  ];

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'No Data', value: 1, color: 'rgba(255,255,255,0.05)' }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      {/* Revenue Area Chart */}
      <Card style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue Stream</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Daily transaction volume (Last 7 Days)</p>
            </div>
        </div>

        <div style={{ height: 260, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayRevenueTrend}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ecff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ecff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00ecff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVal)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Traffic Source - Donut */}
      <Card style={{ padding: "20px 24px", display: "flex", flexDirection: "column", position: "relative" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>
          Lead Sources
        </h3>
        
        <div style={{ height: 200, width: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayPieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {displayPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: 20, fontWeight: 800, color: "#fff" }}>₹{totalRevenue.toLocaleString()}</span>
              <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Total Rev</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 20 }}>
            {pieData.map((item) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{item.name}</span>
                </div>
            ))}
            {pieData.length === 0 && <span style={{ fontSize: 11, color: "var(--muted)" }}>No source data yet</span>}
        </div>
      </Card>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>
);