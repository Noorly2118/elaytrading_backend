import { createRequire } from "module";
const require = createRequire(import.meta.url);
const brevo = require("@getbrevo/brevo");

const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } = brevo;

const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || "no-reply@elaytrading.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Elay Trading";

/**
 * Send email verification code
 */
export const sendVerificationEmail = async (email, name, code) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.subject = "Verify Your Email - Elay Trading";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1e3c72; text-align: center;">Elay Trading</h2>
      <h3 style="color: #333;">Hello ${name}!</h3>
      <p>Your verification code is:</p>
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Verification email sent to ${email}:`, data.body?.messageId || data);
    return data;
  } catch (error) {
    const detail = error.response?.body || error.message;
    console.error(`❌ Failed to send verification email to ${email}:`, detail);
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, name) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.sender = { email: FROM_EMAIL, name: FROM_NAME };
  sendSmtpEmail.to = [{ email, name }];
  sendSmtpEmail.subject = "🎉 Welcome to Elay Trading!";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1e3c72; text-align: center;">🧪 Elay Trading</h2>
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 64px;">🎉</div>
        <h3 style="color: #333;">Welcome ${name}!</h3>
        <p style="color: #666; line-height: 1.6;">Your email has been successfully verified.</p>
        <a href="${process.env.FRONTEND_URL}/login"
           style="display: inline-block; background: linear-gradient(to right, #1e3c72, #2a5298); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
          Sign In to Your Account
        </a>
      </div>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Welcome email sent to ${email}:`, data.body?.messageId || data);
    return data;
  } catch (error) {
    const detail = error.response?.body || error.message;
    console.error(`❌ Failed to send welcome email to ${email}:`, detail);
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
};

// For a quick health-check endpoint if you want one
export const testEmailConfig = () => {
  return {
    provider: "brevo",
    api_key: process.env.BREVO_API_KEY ? "✓ Set" : "✗ Missing",
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
  };
};