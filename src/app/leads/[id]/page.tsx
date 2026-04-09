"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLeadAction, getProductsList, convertLeadToSaleAction, sendSmsAction, sendWhatsAppAction } from "@/app/actions/leads";
import { Phone, Mail, ArrowLeft, User, Calendar, BadgeCheck, DollarSign, Package, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [commMode, setCommMode] = useState<"sms" | "whatsapp">("sms");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [leadData, prodData] = await Promise.all([
        getLeadAction(id as string),
        getProductsList()
      ]);
      if (!leadData) router.push("/leads");
      else {
        setLead(leadData);
        setProducts(prodData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);



  async function handleConvertToSale() {
    if (!selectedProduct || !amount) return alert("Please select product and enter amount");
    setConverting(true);
    const res = await convertLeadToSaleAction(lead.id, selectedProduct, Number(amount));
    if (res.success) {
      alert("Lead converted to sale!");
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
    setConverting(false);
  }

  async function handleSendMessage() {
    if (!message.trim()) return alert("Please enter a message");
    if (!lead.phone) return alert("Lead has no phone number");
    
    setSending(true);
    const res = commMode === "sms" 
      ? await sendSmsAction(lead.id, message)
      : await sendWhatsAppAction(lead.id, message);
      
    if (res.success) {
      alert(`Message sent via ${commMode.toUpperCase()}!`);
      setMessage("");
    } else {
      alert("Error: " + res.error);
    }
    setSending(false);
  }

  if (loading) return <div style={loadingStyle}>Loading lead details...</div>;
  if (!lead) return null;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => router.back()} style={backButtonStyle}>
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Leads
        </button>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={titleStyle}>{lead.name}</h1>
            <p style={subtitleStyle}>Lead ID: {lead.id}</p>
          </div>
          <div style={{ ...statusBadgeStyle, background: lead.status === "CONVERTED" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", color: lead.status === "CONVERTED" ? "#34d399" : "#818cf8" }}>
             {lead.status}
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        {/* Contact Info Card */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Contact Information</h3>
          <div style={detailRowStyle}>
            <Phone style={iconStyle} />
            <div>
              <p style={detailLabelStyle}>Phone Number</p>
              <p style={detailValueStyle}>{lead.phone || "Not provided"}</p>
            </div>
          </div>
          <div style={detailRowStyle}>
            <Mail style={iconStyle} />
            <div>
              <p style={detailLabelStyle}>Email Address</p>
              <p style={detailValueStyle}>{lead.email || "Not provided"}</p>
            </div>
          </div>
          <div style={detailRowStyle}>
            <User style={iconStyle} />
            <div>
              <p style={detailLabelStyle}>Assigned Agent</p>
              <p style={detailValueStyle}>{lead.agent?.name || "Unassigned"}</p>
            </div>
          </div>
          <div style={detailRowStyle}>
            <Calendar style={iconStyle} />
            <div>
              <p style={detailLabelStyle}>Created On</p>
              <p style={detailValueStyle}>{new Date(lead.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Conversion Card */}
        {lead.status !== "CONVERTED" && (
          <div style={{ ...cardStyle }}>
            <h3 style={cardTitleStyle}>Log a Sale</h3>
            <p style={{ fontSize: 13, color: "#a1a1aa", marginBottom: 16 }}>Convert this prospect into a paid customer.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#18181b", padding: "8px 12px", borderRadius: 10, border: "1px solid #27272a" }}>
                  <Package style={{ width: 16, height: 16, color: "#52525b" }} />
                  <select 
                    value={selectedProduct} 
                    onChange={e => setSelectedProduct(e.target.value)}
                    style={{ background: "none", border: "none", color: "#fff", fontSize: 14, width: "100%", outline: "none" }}
                  >
                    <option value="" style={{ background: "#18181b" }}>Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} style={{ background: "#18181b" }}>
                        {p.name} - ₹{Number(p.price)}
                      </option>
                    ))}
                  </select>
               </div>

               <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#18181b", padding: "8px 12px", borderRadius: 10, border: "1px solid #27272a" }}>
                  <DollarSign style={{ width: 16, height: 16, color: "#52525b" }} />
                  <input 
                    type="number" 
                    placeholder="Sale Amount (₹)" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{ background: "none", border: "none", color: "#fff", fontSize: 14, width: "100%", outline: "none" }}
                  />
               </div>

               <button 
                onClick={handleConvertToSale}
                disabled={converting}
                style={{ ...commButtonStyle, background: "#8b5cf6", width: "100%", marginTop: 8 }}
               >
                 <BadgeCheck style={{ width: 16, height: 16 }} />
                 {converting ? "Processing..." : "Confirm & Report Sale"}
               </button>
            </div>
          </div>
        )}

        {lead.status === "CONVERTED" && (
          <div style={{ ...cardStyle, borderColor: "#10b981", background: "rgba(16,185,129,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#10b981", marginBottom: 12 }}>
               <BadgeCheck style={{ width: 20, height: 20 }} />
               <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Successfully Converted</h3>
            </div>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>This lead has been archived as a customer. See the Sales module for detailed transaction logs.</p>
          </div>
        )}

        {/* Messaging Card */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
             <h3 style={{ ...cardTitleStyle, marginBottom: 0 }}>Quick Communication</h3>
             <div style={{ display: "flex", gap: 8, background: "#18181b", padding: 4, borderRadius: 10 }}>
               <button 
                onClick={() => setCommMode("sms")}
                style={{ ...modeToggleStyle, background: commMode === "sms" ? "#27272a" : "none", color: commMode === "sms" ? "#fff" : "#71717a" }}
               >SMS</button>
               <button 
                onClick={() => setCommMode("whatsapp")}
                style={{ ...modeToggleStyle, background: commMode === "whatsapp" ? "#27272a" : "none", color: commMode === "whatsapp" ? "#fff" : "#71717a" }}
               >WhatsApp</button>
             </div>
           </div>

           <textarea 
            placeholder={`Type your ${commMode === "sms" ? "SMS" : "WhatsApp"} message here...`}
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={textareaStyle}
           />

           <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={handleSendMessage}
                disabled={sending}
                style={{ ...commButtonStyle, background: commMode === "sms" ? "#3b82f6" : "#22c55e", maxWidth: 180 }}
              >
                {sending ? "Sending..." : <><Send style={{ width: 14, height: 14 }} /> Send Now</>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = { padding: "40px 60px", maxWidth: 1200, margin: "0 auto" };
const loadingStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#a1a1aa" };
const headerStyle: React.CSSProperties = { marginBottom: 32 };
const backButtonStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid #27272a", borderRadius: 8, padding: "6px 12px", color: "#a1a1aa", fontSize: 12, cursor: "pointer" };
const titleStyle: React.CSSProperties = { fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" };
const subtitleStyle: React.CSSProperties = { fontSize: 13, color: "#52525b", marginTop: 4 };
const statusBadgeStyle: React.CSSProperties = { padding: "6px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" };

const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 };
const cardStyle: React.CSSProperties = { background: "#121214", border: "1px solid #27272a", borderRadius: 20, padding: 24 };
const cardTitleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 };

const detailRowStyle: React.CSSProperties = { display: "flex", gap: 16, marginBottom: 16 };
const iconStyle: React.CSSProperties = { width: 18, height: 18, color: "#52525b", marginTop: 2 };
const detailLabelStyle: React.CSSProperties = { fontSize: 11, color: "#52525b", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" };
const detailValueStyle: React.CSSProperties = { fontSize: 14, color: "#d4d4d8", marginTop: 2 };

const textareaStyle: React.CSSProperties = { width: "100%", height: 100, background: "#18181b", border: "1px solid #27272a", borderRadius: 12, padding: 12, color: "#fff", fontSize: 14, marginBottom: 16, outline: "none", resize: "none" };
const commButtonStyle: React.CSSProperties = { flex: 1, height: 40, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" };
const modeToggleStyle: React.CSSProperties = { border: "none", borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" };
