import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export class AgentService {
  /**
   * Calculates exhaustive performance metrics for a single agent
   */
  static async getAgentMetrics(agentId: string) {
    const [agent, totalLeads, convertedLeads, totalCalls, sales] = await Promise.all([
      prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          leads: {
            include: {
              calls: true,
              sales: {
                include: {
                  product: true,
                  pricingTier: true,
                }
              },
            }
          }
        }
      }),
      prisma.lead.count({ where: { assignedAgentId: agentId } }),
      prisma.lead.count({ where: { assignedAgentId: agentId, status: "CONVERTED" } }),
      prisma.call.count({ where: { agentId: agentId } }),
      prisma.sale.aggregate({
        where: { agentId: agentId },
        _sum: { amount: true }
      })
    ]);

    if (!agent) return null;

    const totalRevenue = Number(sales._sum.amount || 0);
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgAttemptsPerLead = totalLeads > 0 ? totalCalls / totalLeads : 0;

    // Source breakdown
    const sources = await prisma.lead.groupBy({
      by: ['source'],
      where: { assignedAgentId: agentId },
      _count: true
    });

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        leads: agent.leads.map(lead => ({
          id: lead.id,
          name: lead.name,
          status: lead.status,
          priority: lead.priority,
          sales: lead.sales.map((sale: any) => ({
            id: sale.id,
            amount: Number(sale.amount),
            product: sale.product ? {
              id: sale.product.id,
              name: sale.product.name,
              price: sale.product.price ? Number(sale.product.price) : 0,
              currency: sale.product.currency
            } : null
          }))
        }))
      },
      totalLeads,
      convertedLeads,
      totalRevenue,
      conversionRate,
      avgAttemptsPerLead,
      totalCalls,
      sources: sources.map(s => ({ source: s.source, count: s._count }))
    };
  }

  /**
   * Returns top performing agents based on Revenue/Conversion
   */
  static async getTopPerformers() {
    const agents = await prisma.agent.findMany({
      include: {
        _count: {
          select: {
            leads: true,
            sales: true,
            calls: true,
          }
        },
        leads: {
          include: {
            _count: {
              select: {
                calls: true,
                sales: true
              }
            },
            sales: {
                include: {
                    product: true,
                    pricingTier: true
                }
            }
          }
        },
        sales: {
          select: {
            amount: true
          }
        }
      }
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      revenue: agent.sales.reduce((sum, s) => sum + Number(s.amount), 0),
      conversionRate: agent._count.leads > 0 
        ? (agent._count.sales / agent._count.leads) * 100 
        : 0,
      avgAttempts: agent._count.leads > 0 
        ? (agent._count.calls / agent._count.leads)
        : 0,
      _count: agent._count,
      // Convert nested sales and product prices from Decimal to number
      leads: agent.leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        status: lead.status,
        priority: lead.priority,
        sales: lead.sales.map((sale: any) => ({
          id: sale.id,
          amount: Number(sale.amount),
          product: sale.product ? {
            id: sale.product.id,
            name: sale.product.name,
            price: sale.product.price ? Number(sale.product.price) : 0,
            currency: sale.product.currency
          } : null
        }))
      }))
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }
}
