import nodemailer from 'nodemailer';

// Create transporter with your Gmail + App Password
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
    console.error('Check your EMAIL_USER and EMAIL_PASSWORD in .env');
  } else {
    console.log('✅ Email transporter is ready to send emails');
  }
});

/**
 * Send email verification code
 */
export const sendVerificationEmail = async (email, name, code) => {
  try {
    const mailOptions = {
      from: `"Elay Trading" <${process.env.EMAIL_USER}>`,  // Use your Gmail as from
      to: email,
      subject: 'Verify Your Email - Elay Trading',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #1e3c72; text-align: center;">🧪 Elay Trading</h2>
          <h3 style="color: #333;">Hello ${name}!</h3>
          <p>Your verification code is:</p>
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 32px; letter-spacing: 8px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error; // Re-throw so controller knows it failed
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"Elay Trading" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Elay Trading!',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}:`, info.messageId);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error.message);
    throw error;
  }
};

// For testing - add this endpoint temporarily in your server.js
export const testEmailConfig = () => {
  return {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER ? '✓ Set' : '✗ Missing',
      pass: process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing',
    }
  };
};