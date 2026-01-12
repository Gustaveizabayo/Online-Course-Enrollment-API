import nodemailer from 'nodemailer';
import { config } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private isTest: boolean;

  constructor() {
    this.isTest = config.env === 'test';
    
    if (!this.isTest) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (this.isTest) {
      console.log('[TEST] Email would be sent:', {
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Verification Service" <${config.smtp.user}>`,
        ...options,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    const text = `Your verification code is ${otpCode}.\nThis code expires in 5 minutes.`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome! í²™</h1>
          <p>Your one-time verification code is:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1f2937;">
            ${otpCode}
          </div>
          <p>Enter this code to securely activate your account.</p>
          <p><strong>This code expires in 5 minutes.</strong></p>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Your Verification Code',
      text,
      html,
    });
  }
}

export const emailService = new EmailService();
