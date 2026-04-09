"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAssignDataAction() {
  try {
    const [leads, users] = await Promise.all([
      (prisma as any).lead.findMany({
        where: { assignedAgentId: null },
        orderBy: { createdAt: "desc" },
      }),
      (prisma as any).user.findMany({
        include: {
          _count: {
            select: { leads: true }
          }
        }
      })
    ]);

    return {
      leads: (leads as any[]).map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        email: l.email,
        status: l.status,
        source: l.source,
        priority: l.priority,
        createdAt: l.createdAt.toISOString(),
      })),
      agents: (users as any[]).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        _count: u._count,
      })),
    };
  } catch (error) {
    console.error("Assign data error:", error);
    return { leads: [], agents: [] };
  }
}


export async function assignLeadAction(leadId: string, agentId: string) {
  try {
    await (prisma as any).lead.update({
      where: { id: leadId },
      data: {
        assignedAgentId: agentId,
        status: "CONTACTED"
      }
    });
    revalidatePath("/assign");
    revalidatePath("/");
    revalidatePath("/performance");
    return { success: true };
  } catch (error) {
    console.error("Assign lead error:", error);
    return { success: false, error: "Failed to assign lead." };
  }
}
