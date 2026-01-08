import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize() {
    // Create transporter with your app password
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'ynvw cbnh zimj ykvx' // Your app password
      }
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        console.error('Email service error:', error);
      } else {
        console.log('âœ… Email service is ready to send messages');
      }
    });
  }

  static async sendEmail(options: EmailOptions) {
    if (!this.transporter) {
      this.initialize();
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Course Platform" <noreply@courseplatform.com>',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`í³§ Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }

  // ========== SPECIFIC EMAIL TEMPLATES ==========

  static async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Course Platform! í¾‰</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with our course platform. We're excited to have you on board!</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937;">Getting Started:</h3>
          <ul>
            <li>Browse available courses</li>
            <li>Enroll in courses that interest you</li>
            <li>Track your learning progress</li>
            <li>Connect with instructors and other students</li>
          </ul>
        </div>

        <p>If you have any questions, feel free to reply to this email.</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Course Platform!',
      html
    });
  }

  static async sendInstructorApplicationSubmitted(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Instructor Application Submitted í³‹</h2>
        <p>Hello ${name},</p>
        <p>Your application to become an instructor has been received and is now pending review by our admin team.</p>
        
        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400E;">What happens next?</h3>
          <ol>
            <li>Our admin team will review your application</li>
            <li>You'll receive an email notification once a decision is made</li>
            <li>If approved, you'll gain access to instructor features</li>
            <li>If additional information is needed, we'll contact you</li>
          </ol>
        </div>

        <p><strong>Estimated review time:</strong> 1-3 business days</p>
        
        <p>In the meantime, you can continue browsing and enrolling in courses as a student.</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Your Instructor Application is Under Review',
      html
    });
  }

  static async sendInstructorApproved(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">í¾‰ Congratulations! You're Now an Instructor</h2>
        <p>Hello ${name},</p>
        <p>Great news! Your instructor application has been <strong>approved</strong>!</p>
        
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065F46;">What you can do now:</h3>
          <ul>
            <li>Create and manage courses</li>
            <li>Upload lesson content</li>
            <li>View student progress and analytics</li>
            <li>Set up payment for your courses</li>
            <li>Access the instructor dashboard</li>
          </ul>
        </div>

        <a href="${process.env.APP_URL || 'http://localhost:3002'}/dashboard/instructor" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Go to Instructor Dashboard â†’
        </a>
        
        <p style="margin-top: 20px;">Need help getting started? Check out our <a href="${process.env.APP_URL || 'http://localhost:3002'}/guides/instructor">Instructor Guide</a>.</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Instructor Application Approved!',
      html
    });
  }

  static async sendInstructorRejected(email: string, name: string, reason: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Instructor Application Update</h2>
        <p>Hello ${name},</p>
        <p>Thank you for your interest in becoming an instructor on our platform.</p>
        
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #991B1B;">Application Status: Not Approved</h3>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You can reapply after addressing the feedback above.</p>
        </div>

        <p>If you have any questions about this decision, please reply to this email.</p>
        
        <p>We encourage you to continue learning on our platform and consider reapplying in the future.</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Update on Your Instructor Application',
      html
    });
  }

  static async sendCoursePublished(email: string, name: string, courseTitle: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">íº€ Your Course is Now Live!</h2>
        <p>Hello ${name},</p>
        <p>Congratulations! Your course <strong>"${courseTitle}"</strong> has been published and is now visible to all students.</p>
        
        <div style="background-color: #DBEAFE; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1E40AF;">Course Details:</h3>
          <p><strong>Title:</strong> ${courseTitle}</p>
          <p><strong>Status:</strong> Published and available to students</p>
          <p><strong>Students can now:</strong> View, enroll in, and start learning from your course</p>
        </div>

        <a href="${process.env.APP_URL || 'http://localhost:3002'}/courses/${courseTitle.toLowerCase().replace(/ /g, '-')}" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          View Your Course â†’
        </a>
        
        <p style="margin-top: 20px;">Share your course with others to get your first students!</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Course Published: "${courseTitle}"`,
      html
    });
  }

  static async sendPasswordReset(email: string, name: string, resetToken: string) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your Course Platform account.</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            Reset Password
          </a>
          <p style="margin-top: 10px; color: #6B7280; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
        </div>

        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>For security reasons, this link will expire in 1 hour.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
          <p><strong>Security Tip:</strong> Never share your password with anyone. Our team will never ask for your password.</p>
        </div>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Course Platform',
      html
    });
  }

  static async sendEnrollmentConfirmation(email: string, name: string, courseTitle: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">í¾“ You're Enrolled!</h2>
        <p>Hello ${name},</p>
        <p>Congratulations! You've successfully enrolled in <strong>"${courseTitle}"</strong>.</p>
        
        <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534;">Ready to start learning?</h3>
          <p>Access your course anytime from your dashboard to begin your learning journey.</p>
        </div>

        <a href="${process.env.APP_URL || 'http://localhost:3002'}/my-courses" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Go to My Courses â†’
        </a>
        
        <p style="margin-top: 20px;">Happy learning! íº€</p>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Enrollment Confirmation: "${courseTitle}"`,
      html
    });
  }

  static async sendPaymentReceipt(email: string, name: string, courseTitle: string, amount: number, transactionId: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">í²³ Payment Confirmed</h2>
        <p>Hello ${name},</p>
        <p>Thank you for your purchase! Your payment has been successfully processed.</p>
        
        <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534;">Payment Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Course:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">$${amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Transaction ID:</strong></td>
              <td style="padding: 8px;">${transactionId}</td>
            </tr>
          </table>
        </div>

        <p>You can now access the course from your dashboard.</p>
        
        <a href="${process.env.APP_URL || 'http://localhost:3002'}/my-courses" 
           style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Access Your Course â†’
        </a>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
          <p>This email serves as your receipt. Please keep it for your records.</p>
        </div>
        
        <p>Best regards,<br>The Course Platform Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Receipt: "${courseTitle}"`,
      html
    });
  }
}

// Initialize email service on import
EmailService.initialize();
