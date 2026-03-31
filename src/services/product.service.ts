import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export class ProductService {
  /**
   * Fetches all products
   */
  static async getProducts() {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Creates a single product
   */
  static async createProduct(data: {
    name: string;
    price: number | string;
    currency: string;
    duration?: string;
    status?: string;
    category?: string;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        price: String(data.price),
        currency: data.currency,
        duration: data.duration,
        status: data.status,
        category: data.category,
      },
    });
  }

  /**
   * Bulk creates products (useful for CSV import)
   */
  static async bulkCreateProducts(products: Array<{
    name: string;
    price: number | string;
    currency: string;
    duration?: string;
    status?: string;
    category?: string;
  }>) {
    return prisma.product.createMany({
      data: products.map(p => ({
        name: p.name,
        price: String(p.price),
        currency: p.currency,
        duration: p.duration,
        status: p.status,
        category: p.category,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Updates an existing product
   */
  static async updateProduct(id: string, data: {
    name?: string;
    price?: number | string;
    currency?: string;
    duration?: string;
    status?: string;
    category?: string;
  }) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price !== undefined ? String(data.price) : undefined,
        currency: data.currency,
        duration: data.duration,
        status: data.status,
        category: data.category,
      },
    });
  }

  /**
   * Deletes a product
   */
  static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
