"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(env_1.env.SMTP_PORT || '587'),
            secure: env_1.env.SMTP_SECURE === 'true',
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"Course Platform" <${env_1.env.SMTP_FROM || env_1.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email sent: ${info.messageId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error sending email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(to, name) {
        const subject = 'Welcome to Course Platform!';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Course Platform, ${name}! 🎉</h2>
        <p>Thank you for registering with Course Platform. We're excited to have you on board!</p>
        <p>Start exploring our courses and begin your learning journey today.</p>
        <a href="${env_1.env.BASE_URL}/courses" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
          Browse Courses
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you have any questions, feel free to reply to this email.
        </p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
    async sendEnrollmentConfirmation(to, studentName, courseTitle) {
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
        <a href="${env_1.env.BASE_URL}/my-courses" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
          Go to My Courses
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Happy learning!
        </p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
    async sendPaymentReceipt(to, studentName, courseTitle, amount, transactionId) {
        const subject = `Payment Receipt for ${courseTitle}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Payment Receipt 💳</h2>
        <p>Dear ${studentName},</p>
        <p>Thank you for your payment. Here are your transaction details:</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Course:</td>
              <td style="padding: 8px 0; font-weight: bold;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
              <td style="padding: 8px 0; font-weight: bold;">$${amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
              <td style="padding: 8px 0; font-weight: bold;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date:</td>
              <td style="padding: 8px 0; font-weight: bold;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        <p>You can view your payment history in your account dashboard.</p>
        <a href="${env_1.env.BASE_URL}/my-payments" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px;">
          View Payment History
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          This email serves as your receipt. Please keep it for your records.
        </p>
      </div>
    `;
        return this.sendEmail({ to, subject, html });
    }
}
exports.emailService = new EmailService();
