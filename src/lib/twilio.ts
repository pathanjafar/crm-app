import { Twilio } from "twilio";

// Function to get a fresh client when needed
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials missing in environment variables. Please check your .env file.");
  }

  // Initialize using the class constructor for better reliability
  const client = new Twilio(accountSid, authToken);
  
  if (!client || !client.messages) {
    throw new Error("Failed to initialize Twilio client with messages support. Check SDK version.");
  }

  return client;
}

// Helper to format phone number to E.164
function formatPhoneNumber(phone: string) {
  // Remove everything except numbers and the plus sign
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

export async function sendSMS(to: string, message: string) {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const formattedTo = formatPhoneNumber(to);
  
  console.log(`[Twilio] Sending SMS From: ${fromNumber} To: ${formattedTo}`);

  try {
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    });
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error("Twilio SMS Error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsApp(to: string, message: string) {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  const formattedTo = formatPhoneNumber(to);

  try {
    const client = getTwilioClient();
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedTo}`,
    });
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error("Twilio WhatsApp Error:", error);
    return { success: false, error: error.message };
  }
}
