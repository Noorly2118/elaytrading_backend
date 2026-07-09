import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use your verified domain once set up; falls back to Resend's test sender otherwise.
const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Elay Trading <onboarding@resend.dev>";

/**
 * Send email verification code
 */
export const sendVerificationEmail = async (email, name, code) => {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Verify Your Email - Elay Trading",
    html: `
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
    `,
  });

  if (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    throw new Error(error.message || "Failed to send verification email");
  }

  console.log(`✅ Verification email sent to ${email}:`, data.id);
  return data;
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, name) => {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "🎉 Welcome to Elay Trading!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1e3c72; text-align: center;"> Elay Trading</h2>
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
    `,
  });

  if (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error);
    throw new Error(error.message || "Failed to send welcome email");
  }

  console.log(`✅ Welcome email sent to ${email}:`, data.id);
  return data;
};

// For a quick health-check endpoint if you want one
export const testEmailConfig = () => {
  return {
    provider: "resend",
    apiKey: process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing",
    from: FROM_ADDRESS,
  };
};