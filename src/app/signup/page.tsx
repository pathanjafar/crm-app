"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signupWithOtpAction, sendOtpAction } from "@/app/actions/auth";
import Link from "next/link";
import { Zap, User, ArrowRight, Phone, KeyRound, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"INFO" | "OTP">("INFO");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) return setError("Name and Phone are required");
    setLoading(true);
    setError("");

    try {
      const result = await sendOtpAction(phone, "SIGNUP");
      if (result?.error) {
        setError(result.error);
      } else {
        setStep("OTP");
      }
    } catch (err) {
      setError("Failed to send verification code. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return setError("Please enter the 6-digit code");
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("otp", otp);

    try {
      const result = await signupWithOtpAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/login?message=Account created successfully. You can now log in.");
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
          <h1 style={titleStyle}>Join CRM</h1>
          <p style={subtitleStyle}>
            {step === "INFO" 
              ? "Create your agent account using your phone number" 
              : `Enter the code sent to ${phone}`}
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {step === "INFO" ? (
          <form onSubmit={handleSendOTP} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrapperStyle}>
                <User style={iconFieldStyle} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

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
              {loading ? "Sending Code..." : "Send Verification Code"}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={formStyle}>
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
              {loading ? "Creating Account..." : "Complete Signup"}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>

            <button 
              type="button" 
              onClick={() => setStep("INFO")}
              style={{ ...backToInfoStyle }}
            >
              <ArrowLeft style={{ width: 12, height: 12 }} />
              Go Back
            </button>
          </form>
        )}

        <div style={linkContainerStyle}>
          Already have an account? <Link href="/login" style={linkStyle}>Sign In</Link>
        </div>

        <div style={footerStyle}>
          <p>© 2026 CRM Performance Dashboard</p>
        </div>
      </div>
    </div>
  );
}

const backToInfoStyle: React.CSSProperties = {
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

const footerStyle: React.CSSProperties = {
  marginTop: 32,
  textAlign: "center",
  fontSize: 12,
  color: "#3f3f46",
};
