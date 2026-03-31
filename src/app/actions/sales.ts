"use server";

import prisma from "@/lib/db";

export async function getSalesAction() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { id: true, name: true, phone: true, email: true } },
        product: { select: { id: true, name: true, price: true, currency: true } },
        agent: { select: { id: true, name: true } },
      }
    });

    return sales.map((s) => ({
      id: s.id,
      amount: Number(s.amount),
      status: s.status,
      paymentMethod: s.paymentMethod,
      createdAt: s.createdAt.toISOString(),
      lead: s.lead ? { id: s.lead.id, name: s.lead.name, phone: s.lead.phone, email: s.lead.email } : null,
      product: s.product ? { id: s.product.id, name: s.product.name, price: s.product.price ? Number(s.product.price) : null, currency: s.product.currency } : null,
      agent: s.agent ? { id: s.agent.id, name: s.agent.name } : null,
    }));
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return [];
  }
}
