"use server";

import { revalidatePath } from "next/cache";
import { LeadService } from "@/services/lead.service";
import prisma from "@/lib/db";

export async function getLeadsAction() {
  try {
    return await LeadService.getLeads();
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
