"use server";

import { OtpService } from "@/services/otp.service";
import prisma from "@/lib/db";

export async function sendOtpAction(phone: string, type: "LOGIN" | "SIGNUP") {
  if (!phone) return { error: "Phone number is required" };

  try {
    const user = await (prisma as any).user.findFirst({ where: { phone } });

    if (type === "LOGIN" && !user) {
      return { error: "Phone number not registered. Please sign up first." };
    }

    if (type === "SIGNUP" && user) {
      return { error: "Phone number already registered. Please log in." };
    }

    const res = await OtpService.generateAndSendOTP(phone);
    return res;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signupWithOtpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const otp = formData.get("otp") as string;

  if (!name || !phone || !otp) return { error: "Name, Phone and OTP are required" };

  try {
    // 1. Verify OTP
    const verify = await OtpService.verifyOTP(phone, otp);
    if (!verify.success) return { error: verify.error };

    // 2. Check if user already exists
    const existing = await (prisma as any).user.findFirst({ where: { phone } });
    if (existing) return { error: "User already exists. Please log in." };

    // 3. Create user
    await (prisma as any).user.create({
      data: {
        name,
        phone,
        email: `${phone}@crm.com`,
        role: "AGENT"
      }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
