"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ShoppingBag, 
  Upload, 
  Trash2, 
  Edit3,
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Search,
  X
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { 
  getProductsAction, 
  createProductAction, 
  updateProductAction,
  deleteProductAction, 
  bulkImportProductsAction 
} from "@/app/actions/products";
import Papa from "papaparse";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products on mount
  useEffect(() => {
    refreshProducts();
  }, []);

  async function refreshProducts() {
    setLoading(true);
    const data = await getProductsAction();
    setProducts(data);
    setLoading(false);
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await deleteProductAction(id);
    if (res.success) refreshProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const res = await bulkImportProductsAction(results.data);
        if (res.success) {
          alert(`Successfully imported ${res.count} products!`);
          refreshProducts();
        } else {
          alert(res.error);
        }
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
        setImporting(false);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--background)" }}>
      <Topbar
        title="Products"
        subtitle={`${products.length} products in catalog`}
        searchPlaceholder="Search products..."
        onSearch={setSearch}
        action={{ label: "Add Product", onClick: () => { setEditingProduct(null); setShowModal(true); } }}
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", gap: 12 }}>
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                style={{ 
                    height: 36, padding: "0 16px", borderRadius: 9, 
                    background: "var(--surface-2)", border: "1px solid var(--border)", 
                    color: "var(--foreground)", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
                }}
             >
                <Upload style={{ width: 14, height: 14 }} />
                {importing ? "Importing..." : "Import CSV"}
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCsvUpload} 
                accept=".csv" 
                style={{ display: "none" }} 
             />
           </div>
        </div>

        {/* Content */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Product Catalog</h2>
            <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtered.length} products</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "var(--surface-1)" }}>
                   <th style={thStyle}>Product</th>
                   <th style={thStyle}>Price</th>
                   <th style={thStyle}>Duration</th>
                   <th style={thStyle}>Status</th>
                   <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading products...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>No products found. Start by adding one or importing a CSV.</td></tr>
                ) : (
                  filtered.map((product, i) => (
                    <tr key={product.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                           <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <ShoppingBag style={{ width: 15, height: 15, color: "#818cf8" }} />
                           </div>
                           <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{product.name}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                         <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                            {product.currency} {Number(product.price).toLocaleString()}
                         </div>
                      </td>
                      <td style={tdStyle}>
                         <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                            <Clock style={{ width: 13, height: 13 }} />
                            {product.duration || "N/A"}
                         </div>
                      </td>
                      <td style={tdStyle}>
                         <span style={{ 
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                            background: product.status === "ACTIVE" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                            color: product.status === "ACTIVE" ? "#10b981" : "#ef4444"
                         }}>
                            {product.status}
                         </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                         <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button 
                                onClick={() => handleEdit(product)}
                                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6 }}
                            >
                                <Edit3 style={{ width: 15, height: 15 }} />
                            </button>
                            <button 
                                onClick={() => handleDelete(product.id)}
                                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6 }}
                            >
                                <Trash2 style={{ width: 15, height: 15 }} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Product Modal (Add/Edit) */}
      <AnimatePresence>
        {showModal && (
          <div style={{ 
            position: "fixed", inset: 0, zIndex: 100, 
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)"
          }}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 440, overflow: "hidden" }}
            >
               <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                    <X style={{ width: 20, height: 20 }} />
                  </button>
               </div>

               <form action={async (formData) => {
                  const res = editingProduct 
                    ? await updateProductAction(editingProduct.id, formData)
                    : await createProductAction(formData);
                    
                  if (res.success) {
                    setShowModal(false);
                    refreshProducts();
                  } else {
                    alert(res.error);
                  }
               }} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Product Name</label>
                    <input name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Enterprise Cloud" style={inputStyle} />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Price</label>
                        <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required placeholder="0.00" style={inputStyle} />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Currency</label>
                        <input name="currency" defaultValue={editingProduct?.currency || "INR"} placeholder="INR" style={inputStyle} />
                    </div>
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Duration</label>
                    <input name="duration" defaultValue={editingProduct?.duration} placeholder="e.g. Monthly, One-time" style={inputStyle} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Status</label>
                    <select name="status" defaultValue={editingProduct?.status || "ACTIVE"} style={inputStyle}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: 42, borderRadius: 10, background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--foreground)", fontWeight: 600, cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button type="submit" style={{ flex: 2, height: 42, borderRadius: 10, background: "#6366f1", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                        {editingProduct ? "Save Changes" : "Create Product"}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>
    {children}
  </div>
);

const thStyle: React.CSSProperties = {
  padding: "12px 20px", 
  fontSize: 11, 
  fontWeight: 600, 
  color: "var(--muted)", 
  textTransform: "uppercase", 
  letterSpacing: "0.07em", 
  textAlign: "left", 
  borderBottom: "1px solid var(--border)"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 20px",
  borderBottom: "1px solid var(--border)"
};

const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.03em"
};

const inputStyle: React.CSSProperties = {
    height: 40,
    width: "100%",
    padding: "0 12px",
    borderRadius: 8,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box"
};
