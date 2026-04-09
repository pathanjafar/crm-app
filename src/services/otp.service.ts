import prisma from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

export class OtpService {
  /**
   * Generates a 6-digit OTP, saves it to the database, and sends it via Twilio.
   */
  static async generateAndSendOTP(phone: string) {
    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set expiry (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Development Helper: Log the code so you can sign in without receiving the SMS
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[DEV] SMS OTP for ${phone}: ${code}\n`);
    }

    try {
      // 3. Save to database
      await (prisma as any).otp.create({
        data: {
          phone,
          code,
          expiresAt,
        },
      });

      // 4. Send via Twilio
      const message = `Your CRM access code is: ${code}. It expires in 5 minutes.`;
      const result = await sendSMS(phone, message);

      if (!result.success) {
        throw new Error(result.error || "Failed to send SMS");
      }

      return { success: true };
    } catch (error: any) {
      console.error("OTP Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifies the OTP provided by the user.
   */
  static async verifyOTP(phone: string, code: string) {
    try {
      const otpRecord = await (prisma as any).otp.findFirst({
        where: {
          phone,
          code,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return { success: false, error: "Invalid or expired OTP" };
      }

      // Delete the OTP after successful verification to prevent reuse
      await (prisma as any).otp.deleteMany({
        where: { phone },
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
