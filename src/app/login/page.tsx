"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight, CheckCircle2, Phone, KeyRound, ArrowLeft } from "lucide-react";
import { sendOtpAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={containerStyle}><p style={{ color: "#fff" }}>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return setError("Please enter your phone number");
    setLoading(true);
    setError("");

    try {
      const res = await sendOtpAction(phone, "LOGIN");
      if (res?.error) {
        setError(res.error);
      } else {
        setStep("OTP");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return setError("Please enter the 6-digit code");
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid or expired code. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoIconStyle}>
            <Zap style={{ width: 20, height: 20, color: "#818cf8" }} />
          </div>
          <h1 style={titleStyle}>CRM Login</h1>
          <p style={subtitleStyle}>
            {step === "PHONE" 
              ? "Enter your phone number to receive a secure access code" 
              : `Enter the code sent to ${phone}`}
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {message && (
          <div style={successStyle}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            {message}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleSendOTP} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Phone Number</label>
              <div style={inputWrapperStyle}>
                <Phone style={iconFieldStyle} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14786066332"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Sending..." : "Send Access Code"}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>6-Digit Code</label>
              <div style={inputWrapperStyle}>
                <KeyRound style={iconFieldStyle} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  style={inputStyle}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Verifying..." : "Verify & Sign In"}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>

            <button 
              type="button" 
              onClick={() => setStep("PHONE")}
              style={{ ...backToPhoneStyle }}
            >
              <ArrowLeft style={{ width: 12, height: 12 }} />
              Change Phone Number
            </button>
          </form>
        )}

        <div style={linkContainerStyle}>
          Don't have an account? <Link href="/signup" style={linkStyle}>Create Account</Link>
        </div>

        <div style={footerStyle}>
          <p>© 2026 CRM Performance Dashboard</p>
        </div>
      </div>
    </div>
  );
}

const backToPhoneStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#71717a",
  fontSize: 13,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  cursor: "pointer",
  marginTop: 8,
};

const linkContainerStyle: React.CSSProperties = {
  marginTop: 24,
  textAlign: "center",
  fontSize: 14,
  color: "#a1a1aa",
};

const linkStyle: React.CSSProperties = {
  color: "#818cf8",
  textDecoration: "none",
  fontWeight: 600,
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "#09090b",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 400,
  background: "#121214",
  border: "1px solid #27272a",
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 32,
};

const logoIconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  background: "rgba(99,102,241,0.15)",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#fff",
  letterSpacing: "-0.03em",
  marginBottom: 8,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#a1a1aa",
  lineHeight: 1.5,
};
const successStyle: React.CSSProperties = {
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.2)",
  color: "#4ade80",
  padding: "12px 16px",
  borderRadius: 12,
  fontSize: 13,
  marginBottom: 24,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const errorStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#f87171",
  padding: "12px 16px",
  borderRadius: 12,
  fontSize: 13,
  marginBottom: 24,
  textAlign: "center",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#71717a",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
};

const iconFieldStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  width: 16,
  height: 16,
  color: "#52525b",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 12,
  padding: "0 12px 0 40px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  transition: "all 0.2s",
};

const buttonStyle: React.CSSProperties = {
  height: 48,
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  cursor: "pointer",
  transition: "all 0.2s",
  marginTop: 8,
};

const footerStyle: React.CSSProperties = {
  marginTop: 32,
  textAlign: "center",
  fontSize: 12,
  color: "#3f3f46",
};
