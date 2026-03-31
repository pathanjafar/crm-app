import prisma from "@/lib/db";

export class LeadService {
  /**
   * Manual assignment of a lead by an Admin
   */
  static async assignLead(leadId: string, agentId: string, adminId: string) {
    return prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedAgentId: agentId,
        assignedById: adminId,
        status: "CONTACTED",
      }
    });
  }

  /**
   * Fetches all unassigned leads for the assignment UI
   */
  static async getUnassignedLeads() {
    return prisma.lead.findMany({
      where: { assignedAgentId: null },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Fetches all leads
   */
  static async getLeads() {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { id: true, name: true } } }
    });

    return leads.map(l => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      status: l.status,
      source: l.source,
      education: l.education,
      priority: l.priority,
      assignedAgentId: l.assignedAgentId,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      agent: l.agent ? { id: l.agent.id, name: l.agent.name } : null,
    }));
  }

  /**
   * Updates an existing lead
   */
  static async updateLead(id: string, data: any) {
    return prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        status: data.status,
        source: data.source,
        priority: data.priority,
      }
    });
  }

  /**
   * Bulk creates leads (useful for CSV import)
   */
  static async bulkCreateLeads(leads: Array<{
    name: string;
    phone?: string;
    email?: string;
    source: any;
    priority?: any;
    status?: any;
  }>) {
    return prisma.lead.createMany({
      data: leads,
      skipDuplicates: true,
    });
  }
}
