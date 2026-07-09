import { createRequire } from "module";
const require = createRequire(import.meta.url);
const brevo = require("@getbrevo/brevo");

console.log("=== BREVO DEBUG ===");
console.log("Top-level keys:", Object.keys(brevo));
console.log("Has default?", "default" in brevo);
if (brevo.default) {
  console.log("Keys under .default:", Object.keys(brevo.default));
}
console.log("Type of TransactionalEmailsApi:", typeof brevo.TransactionalEmailsApi);
console.log("=== END BREVO DEBUG ===");

const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } = brevo;

// ===============================
// Brevo Configuration
// ===============================

let apiInstance = null;
try {
  apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(
    TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
} catch (err) {
  console.error("⚠️ Failed to initialize Brevo TransactionalEmailsApi:", err.message);
}

const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || "noorly21118@gmail.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Elay Trading";

// ===============================
// Send Verification Email
// ===============================

export const sendVerificationEmail = async (email, name, code) => {
  if (!apiInstance) {
    throw new Error("Brevo API not initialized - check server logs for BREVO DEBUG output");
  }

  try {
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.subject = "Verify Your Email - Elay Trading";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color:#1e3c72; text-align:center;">Elay Trading</h2>
        <h3>Hello ${name}</h3>
        <p>Your verification code is:</p>
        <div style="background:#1e3c72; color:white; padding:15px; text-align:center; font-size:32px; letter-spacing:8px; border-radius:8px;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this account, ignore this email.</p>
      </div>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Verification email sent to ${email}`, response.body?.messageId || response);
    return response;
  } catch (error) {
    console.error("❌ Verification email failed:", error.response?.body || error.message);
    throw error;
  }
};

// ===============================
// Send Welcome Email
// ===============================

export const sendWelcomeEmail = async (email, name) => {
  if (!apiInstance) {
    throw new Error("Brevo API not initialized - check server logs for BREVO DEBUG output");
  }

  try {
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
    sendSmtpEmail.to = [{ email, name }];
    sendSmtpEmail.subject = "Welcome to Elay Trading 🎉";
    sendSmtpEmail.htmlContent = `
      <div style="font-family:Arial; max-width:600px; margin:auto; padding:20px;">
        <h2>Welcome ${name}</h2>
        <p>Your email has been successfully verified.</p>
        <p>You can now login to your Elay Trading account.</p>
      </div>
    `;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Welcome email sent to ${email}`, response.body?.messageId || response);
    return response;
  } catch (error) {
    console.error("❌ Welcome email failed:", error.response?.body || error.message);
    throw error;
  }
};

// ===============================
// Email Configuration Check
// ===============================

export const testEmailConfig = () => {
  return {
    provider: "Brevo",
    apiKey: process.env.BREVO_API_KEY ? "✓ SET" : "✗ Missing",
    sender: `${FROM_NAME} <${FROM_EMAIL}>`,
  };
};