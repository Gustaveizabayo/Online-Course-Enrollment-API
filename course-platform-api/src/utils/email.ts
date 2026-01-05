import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailConfig {
  host?: string;
  port?: string;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig = {};

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
    };

    if (this.config.user && this.config.pass) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: parseInt(this.config.port || '587'),
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Course Platform" <${this.config.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to Course Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Course Platform, ${name}! 🎉</h2>
        <p>Thank you for registering with Course Platform. We're excited to have you on board!</p>
        <p>Start exploring our courses and begin your learning journey today.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you have any questions, feel free to contact support.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendEnrollmentConfirmation(
    to: string,
    studentName: string,
    courseTitle: string
  ): Promise<boolean> {
    const subject = `Enrollment Confirmation: ${courseTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Enrollment Confirmed! 🎓</h2>
        <p>Dear ${studentName},</p>
        <p>You have successfully enrolled in the course:</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">${courseTitle}</h3>
        </div>
        <p>You can now access the course materials and start learning immediately.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Happy learning!
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();