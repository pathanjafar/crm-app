"use server";

import { revalidatePath } from "next/cache";
import { ProductService } from "@/services/product.service";

export async function getProductsAction() {
  try {
    const products = await ProductService.getProducts();
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price ? Number(p.price) : 0,
      currency: p.currency,
      duration: p.duration,
      status: p.status,
      category: p.category,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function createProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const currency = formData.get("currency") as string;
  const duration = formData.get("duration") as string;
  const status = formData.get("status") as string;

  if (!name || !price) {
    return { success: false, error: "Name and Price are required fields." };
  }

  try {
    const product = await ProductService.createProduct({
      name,
      price,
      currency,
      duration,
      status,
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { success: false, error: error.message || "Failed to create product in database." };
  }
}

export async function deleteProductAction(id: string) {
    try {
      await ProductService.deleteProduct(id);
      revalidatePath("/products");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete product:", error);
      return { success: false, error: "Failed to delete product." };
    }
  }

export async function bulkImportProductsAction(products: any[]) {
  try {
    const result = await ProductService.bulkCreateProducts(
      products.map((p) => ({
        name: String(p.name || p.Name),
        price: String(p.price || p.Price || 0),
        currency: String(p.currency || p.Currency || "INR"),
        duration: String(p.duration || p.Duration || "Monthly"),
        status: String(p.status || p.Status || "ACTIVE"),
      }))
    );
    revalidatePath("/products");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to bulk import products:", error);
    return { success: false, error: "Failed to bulk import products." };
  }
}

export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const currency = formData.get("currency") as string;
  const duration = formData.get("duration") as string;
  const status = formData.get("status") as string;

  if (!name || !price) {
    return { success: false, error: "Name and Price are required fields." };
  }

  try {
    await ProductService.updateProduct(id, {
      name,
      price,
      currency,
      duration,
      status,
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { success: false, error: error.message || "Failed to update product in database." };
  }
}
