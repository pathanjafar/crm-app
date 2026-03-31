"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

// ── Agents ──────────────────────────────────────────────
export async function getAgentsAction() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { leads: true, sales: true, calls: true } },
        sales: {
          select: { amount: true, status: true }
        }
      }
    });

    return agents.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      role: a.role,
      createdAt: a.createdAt.toISOString(),
      totalLeads: a._count.leads,
      totalSales: a._count.sales,
      totalCalls: a._count.calls,
      revenue: a.sales.reduce((sum, s) => sum + Number(s.amount), 0),
    }));
  } catch (error) {
    console.error("getAgentsAction error:", error);
    return [];
  }
}

export async function createAgentAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = (formData.get("role") as string) || "AGENT";

  if (!name || !email) return { success: false, error: "Name and email are required." };

  try {
    await prisma.agent.create({
      data: { name, email, phone: phone || null, role: role as any }
    });
    revalidatePath("/agents");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "An agent with this email already exists." };
    return { success: false, error: error.message };
  }
}

export async function updateAgentAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;

  try {
    await prisma.agent.update({
      where: { id },
      data: { name, email, phone: phone || null, role: role as any }
    });
    revalidatePath("/agents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgentAction(id: string) {
  try {
    await prisma.agent.delete({ where: { id } });
    revalidatePath("/agents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Cannot delete agent. They may have leads or sales assigned." };
  }
}

// ── Sales Management ─────────────────────────────────────
export async function getSalesForAdminAction() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true, phone: true, email: true } },
        agent: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      }
    });

    return sales.map(s => ({
      id: s.id,
      amount: Number(s.amount),
      status: s.status,
      paymentMethod: s.paymentMethod,
      createdAt: s.createdAt.toISOString(),
      lead: s.lead,
      agent: s.agent,
      product: { id: s.product.id, name: s.product.name },
    }));
  } catch (error) {
    console.error("getSalesForAdminAction error:", error);
    return [];
  }
}

export async function updateSaleStatusAction(saleId: string, status: string) {
  try {
    await prisma.sale.update({
      where: { id: saleId },
      data: { status: status as any }
    });
    revalidatePath("/agents");
    revalidatePath("/sales");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLeadsForSelectAction() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true, email: true }
    });
    return leads;
  } catch {
    return [];
  }
}

export async function createSaleAction(formData: FormData) {
  const leadId       = formData.get("leadId") as string;
  const agentId      = formData.get("agentId") as string;
  const productId    = formData.get("productId") as string;
  const amount       = formData.get("amount") as string;
  const status       = (formData.get("status") as string) || "PAID";
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!leadId || !agentId || !productId || !amount) {
    return { success: false, error: "Lead, Agent, Product and Amount are required." };
  }

  try {
    // 1. Assignment Check
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { assignedAgentId: true }
    });

    if (lead?.assignedAgentId && lead.assignedAgentId !== agentId) {
      // Check if the selling agent is an ADMIN
      const sellingAgent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { role: true }
      });

      if (sellingAgent?.role !== "ADMIN") {
        return { 
          success: false, 
          error: "This lead is assigned to another agent. Only the assigned agent or an Admin can record this sale." 
        };
      }
    }

    // 2. Mark lead as CONVERTED (but do not change assignment)
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" }
    });

    // 3. Create the sale
    await prisma.sale.create({
      data: {
        leadId,
        agentId,
        productId,
        amount: String(Number(amount)),
        status: status as any,
        paymentMethod: paymentMethod || null,
      }
    });

    revalidatePath("/agents");
    revalidatePath("/sales");
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProductsForSelectAction() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, currency: true }
    });
    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price ? Number(p.price) : 0,
      currency: p.currency || "INR",
    }));
  } catch (error) {
    return [];
  }
}

export async function updateSaleAction(saleId: string, formData: FormData) {
  const productId = formData.get("productId") as string;
  const amount    = formData.get("amount") as string;
  const status    = formData.get("status") as string;
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!amount || isNaN(Number(amount))) return { success: false, error: "Valid amount is required." };

  try {
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        productId,
        amount: String(Number(amount)),
        status: status as any,
        paymentMethod: paymentMethod || null,
      }
    });
    revalidatePath("/agents");
    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
