"use server";

import { AgentService } from "@/services/agent.service";

export async function getPerformanceAction() {
  try {
    const agents = await AgentService.getTopPerformers();
    
    // Aggregates for team stats
    const totalRevenue = agents.reduce((sum, a) => sum + (a.revenue || 0), 0);
    const totalLeads = agents.reduce((sum, a) => sum + (a._count.leads || 0), 0);
    const avgConv = agents.length > 0 
      ? agents.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / agents.length 
      : 0;
    const totalCalls = agents.reduce((sum, a) => sum + (a._count.calls || 0), 0);

    return {
      agents,
      teamStats: [
        { label: "Team Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: "Activity", delta: "Real-time" },
        { label: "Total Leads", value: totalLeads.toString(), icon: "Users", delta: "Assigned" },
        { label: "Avg Conv. Rate", value: `${avgConv.toFixed(1)}%`, icon: "Zap", delta: "Average" },
        { label: "Calls Logged", value: totalCalls.toString(), icon: "PhoneOutgoing", delta: "Total" },
      ]
    };
  } catch (error) {
    console.error("Performance stats error:", error);
    return null;
  }
}
