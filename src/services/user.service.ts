import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export class UserService {
  /**
   * Calculates exhaustive performance metrics for a single user
   */
  static async getUserMetrics(userId: string) {
    const [user, totalLeads, convertedLeads, totalCalls, sales] = await Promise.all([
      (prisma as any).user.findUnique({
        where: { id: userId },
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
      (prisma as any).lead.count({ where: { assignedAgentId: userId } }),
      (prisma as any).lead.count({ where: { assignedAgentId: userId, status: "CONVERTED" } }),
      (prisma as any).call.count({ where: { agentId: userId } }),
      (prisma as any).sale.aggregate({
        where: { agentId: userId },
        _sum: { amount: true }
      })
    ]);

    if (!user) return null;

    const totalRevenue = Number(sales._sum.amount || 0);
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgAttemptsPerLead = totalLeads > 0 ? totalCalls / totalLeads : 0;

    // Source breakdown
    const sources = await (prisma as any).lead.groupBy({
      by: ['source'],
      where: { assignedAgentId: userId },
      _count: true
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        leads: user.leads.map((lead: any) => ({
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
      sources: sources.map((s: any) => ({ source: s.source, count: s._count }))
    };
  }

  /**
   * Returns top performing users based on Revenue/Conversion
   */
  static async getTopPerformers() {
    const users = await (prisma as any).user.findMany({
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

    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      revenue: user.sales.reduce((sum: number, s: any) => sum + Number(s.amount), 0),
      conversionRate: user._count.leads > 0 
        ? (user._count.sales / user._count.leads) * 100 
        : 0,
      avgAttempts: user._count.leads > 0 
        ? (user._count.calls / user._count.leads)
        : 0,
      _count: user._count,
      leads: user.leads.map((lead: any) => ({
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
