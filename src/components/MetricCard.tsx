"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, BarChart3, PhoneCall, LucideIcon, MoreVertical } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trendValue: number;
  trendLabel: string;
  iconName?: "dollar" | "users" | "chart" | "phone";
  iconColor?: string;
  progress?: number; 
}

const iconMap: Record<string, LucideIcon> = {
  dollar: DollarSign,
  users: Users,
  chart: BarChart3,
  phone: PhoneCall,
};

export function MetricCard({ title, value, trendValue, trendLabel, iconName, progress = 72 }: MetricCardProps) {
  const Icon = iconName ? iconMap[iconName] : null;
  
  // Progress Ring Calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-panel glass-panel-hover p-10 group relative overflow-hidden flex flex-col items-center justify-center text-center h-full rounded-[2.5rem]"
    >
      {/* 🔮 Header Section (Centered) */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {Icon && (
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,236,255,0.1)] group-hover:scale-110 transition-transform">
            <Icon strokeWidth={2.5} className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,236,255,0.4)]" />
          </div>
        )}
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
      </div>

      {/* 📊 Main Metric (Centered) */}
      <div className="flex flex-col items-center gap-2 mb-10">
        <span className="text-5xl font-black text-white tabular-nums tracking-tighter neon-glow-blue">
          {value}
        </span>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          <span className={`text-[12px] font-black uppercase tracking-tighter ${trendValue >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {trendValue >= 0 ? '+' : ''}{trendValue}%
          </span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{trendLabel}</span>
        </div>
      </div>

      {/* ♾️ Progress Section (Centered) */}
      <div className="relative h-24 w-24 flex items-center justify-center">
          <svg className="h-24 w-24 -rotate-90">
              <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
              />
              <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,236,255,0.6)]"
              />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[16px] font-black text-white tabular-nums">
                {progress}%
            </span>
          </div>
      </div>

      {/* Subtle Interaction Glow */}
      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.02] transition-colors pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/5 blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-all" />
    </motion.div>
  );
}
