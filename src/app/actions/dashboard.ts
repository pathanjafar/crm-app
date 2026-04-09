"use server";

import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardStatsAction() {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const userId = session.user.id;
    const role = (session.user as any).role;

    const whereUser: any = {};
    if (role === "AGENT") {
      whereUser.assignedAgentId = userId;
    }

    const whereSale: any = {};
    if (role === "AGENT") {
      whereSale.agentId = userId;
    }

    const [
      totalLeads,
      activeLeads,
      convertedLeads,
      totalSales,
      totalRevenue
    ] = await Promise.all([
      prisma.lead.count({ where: whereUser }),
      prisma.lead.count({ where: { ...whereUser, status: { in: ["NEW", "CONTACTED", "INTERESTED"] } } }),
      prisma.lead.count({ where: { ...whereUser, status: "CONVERTED" } }),
      prisma.sale.count({ where: { ...whereSale, status: "PAID" } }),
      prisma.sale.aggregate({
        where: { ...whereSale, status: "PAID" },
        _sum: { amount: true }
      })
    ]);

    // Calculating trends for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [dailyLeads, dailySales] = await Promise.all([
      prisma.lead.findMany({
        where: { ...whereUser, createdAt: { gte: last7Days } },
        select: { createdAt: true }
      }),
      prisma.sale.findMany({
        where: { ...whereSale, createdAt: { gte: last7Days } },
        select: { createdAt: true, amount: true }
      })
    ]);

    // Grouping by day (last 7 days)
    const leadSpark = new Array(7).fill(0);
    const saleSpark = new Array(7).fill(0);
    const msPerDay = 1000 * 60 * 60 * 24;
    
    // Normalize today to start of day for accurate diff calculation
    const today = new Date();
    today.setHours(0,0,0,0);

    dailyLeads.forEach(l => {
      const itemDate = new Date(l.createdAt);
      itemDate.setHours(0,0,0,0);
      const diff = Math.round((today.getTime() - itemDate.getTime()) / msPerDay);
      if (diff >= 0 && diff < 7) leadSpark[6 - diff]++;
    });

    dailySales.forEach(s => {
      const itemDate = new Date(s.createdAt);
      itemDate.setHours(0,0,0,0);
      const diff = Math.round((today.getTime() - itemDate.getTime()) / msPerDay);
      if (diff >= 0 && diff < 7) saleSpark[6 - diff] += Number(s.amount);
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueTrend = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { name: dayNames[d.getDay()], value: 0 };
    });

    dailySales.forEach(s => {
      const itemDate = new Date(s.createdAt);
      itemDate.setHours(0,0,0,0);
      const diff = Math.round((today.getTime() - itemDate.getTime()) / msPerDay);
      if (diff >= 0 && diff < 7) revenueTrend[6 - diff].value += Number(s.amount);
    });

    // Traffic Source Breakdown
    const sourceStats = await prisma.lead.groupBy({
      by: ['source'],
      where: whereUser,
      _count: true
    });

    const sourceColors: Record<string, string> = {
      'ORGANIC': '#00ecff',
      'WHATSAPP': '#25d366',
      'FACEBOOK': '#1877f2',
      'INSTAGRAM': '#e4405f',
      'META_ADS': '#9d50bb',
    };

    const pieData = sourceStats.map(s => ({
      name: s.source,
      value: s._count,
      color: sourceColors[s.source] || '#64748b'
    }));

    const revenue = Number(totalRevenue._sum.amount || 0);
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgTicket = totalSales > 0 ? revenue / totalSales : 0;

    // Funnel data
    const funnelStages = await prisma.lead.groupBy({
      by: ['status'],
      where: whereUser,
      _count: true
    });

    const funnelMap: Record<string, number> = {};
    funnelStages.forEach(s => {
      funnelMap[s.status] = s._count;
    });

    const funnel = [
      { label: "New", value: funnelMap["NEW"] || 0, color: "#6366f1" },
      { label: "Contacted", value: funnelMap["CONTACTED"] || 0, color: "#8b5cf6" },
      { label: "Interested", value: funnelMap["INTERESTED"] || 0, color: "#06b6d4" },
      { label: "Converted", value: funnelMap["CONVERTED"] || 0, color: "#10b981" },
      { label: "Lost", value: funnelMap["LOST"] || 0, color: "#ef4444" },
    ];

    return {
      totalLeads,
      activeLeads,
      conversionRate,
      avgTicket,
      revenue,
      funnel,
      leadSpark,
      saleSpark,
      revenueTrend,
      pieData
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
}
