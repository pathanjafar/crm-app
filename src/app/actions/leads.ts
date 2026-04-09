"use server";

import { revalidatePath } from "next/cache";
import { LeadService } from "@/services/lead.service";
import prisma from "@/lib/db";

import { auth } from "@/auth";

export async function getLeadsAction() {
  try {
    const session = await auth();
    if (!session?.user) return [];
    
    return await LeadService.getLeads(
      session.user.id, 
      (session.user as any).role
    );
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return [];
  }
}

export async function bulkImportLeadsAction(leads: any[]) {
  try {
    // Basic mapping for common CSV headers
    const data = leads.map((l) => ({
      name: String(l.name || l.Name || ""),
      phone: String(l.phone || l.Phone || ""),
      email: String(l.email || l.Email || ""),
      source: (l.source || l.Source || "ORGANIC").toUpperCase(),
      priority: (l.priority || l.Priority || "MEDIUM").toUpperCase(),
      status: (l.status || l.Status || "NEW").toUpperCase(),
    }));

    const result = await LeadService.bulkCreateLeads(data);
    revalidatePath("/leads");
    revalidatePath("/"); // Update dashboard counts
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk import leads:", error);
    return { success: false, error: "Failed to bulk import leads." };
  }
}

export async function createLeadAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const source = formData.get("source") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;

  if (!name) return { success: false, error: "Name is required." };

  try {
    // Manually create single lead via prisma directly is easier if service is missing it
    await LeadService.bulkCreateLeads([{ name, email, phone, source, status, priority }]);
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const source = formData.get("source") as string;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;

  try {
    await LeadService.updateLead(id, { name, email, phone, source, status, priority });
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/leads");
    revalidatePath("/");
    revalidatePath("/assign");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Cannot delete lead. It may have associated sales or calls." };
  }
}

export async function getLeadAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user) return null;
    
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { agent: true, calls: true, sales: true }
    });

    if (!lead) return null;

    // AGENT can only see their own leads
    if ((session.user as any).role === "AGENT" && (lead as any).assignedAgentId !== session.user.id) {
       return null;
    }

    const l = lead as any;
    return {
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      status: l.status,
      source: l.source,
      priority: l.priority,
      createdAt: l.createdAt.toISOString(),
      agent: l.agent ? { id: l.agent.id, name: l.agent.name } : null,
      calls: l.calls.map((c: any) => ({
        id: c.id,
        outcome: c.outcome,
        notes: c.notes,
        createdAt: c.createdAt.toISOString()
      })),
      sales: l.sales.map((s: any) => ({
        id: s.id,
        amount: Number(s.amount || 0),
        status: s.status,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt.toISOString()
      }))
    };
  } catch {
    return null;
  }
}

import { sendSMS, sendWhatsApp } from "@/lib/twilio";

export async function sendSmsAction(leadId: string, message: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead?.phone) return { success: false, error: "Lead has no phone number." };
    
    return await sendSMS(lead.phone, message);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendWhatsAppAction(leadId: string, message: string) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead?.phone) return { success: false, error: "Lead has no phone number." };
    
    return await sendWhatsApp(lead.phone, message);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProductsList() {
  try {
    const products = await (prisma as any).product.findMany({
      where: { status: "ACTIVE" }
    });
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || 0),
      status: p.status,
      currency: p.currency,
      duration: p.duration,
      category: p.category
    }));
  } catch {
    return [];
  }
}

export async function convertLeadToSaleAction(leadId: string, productId: string, amount: number) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    // 1. Update Lead status
    await (prisma as any).lead.update({
      where: { id: leadId },
      data: { status: "CONVERTED" }
    });

    // 2. Create Sale record
    await (prisma as any).sale.create({
      data: {
        leadId,
        productId,
        agentId: session.user.id,
        amount,
        status: "PAID",
        paymentMethod: "ONLINE"
      }
    });

    // 3. Create Audit Log
    await (prisma as any).auditLog.create({
      data: {
        entityId: leadId,
        entityType: "LEAD",
        action: "CONVERT_TO_SALE",
        changedBy: session.user.id,
        newValue: { amount: Number(amount), productId }
      }
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/");
    revalidatePath("/performance");
    
    return { success: true };
  } catch (error: any) {
    console.error("Sale conversion error:", error);
    return { success: false, error: error.message };
  }
}

