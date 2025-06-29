import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplateLoader } from './email-template-loader';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  // Email service for sending notifications
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Verify email configuration
    this.validateEmailConfig();
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  private validateEmailConfig(): void {
    const requiredFields = ['host', 'user', 'password'];
    const missing: string[] = [];

    requiredFields.forEach(field => {
      const value = this.configService.get<string>(`email.${field}`);
      if (!value) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      this.logger.warn(`Missing email configuration: ${missing.join(', ')}`);
      this.logger.warn('Email sending may fail. Please check your environment variables.');
    } else {
      this.logger.log('Email configuration validated successfully');
    }
  }

  private loadTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      this.logger.debug(`Loading template: ${templateName} with variables: ${JSON.stringify(Object.keys(variables))}`);
      const renderedTemplate = EmailTemplateLoader.renderTemplate(templateName, variables);
      this.logger.debug(`Successfully loaded and rendered template: ${templateName}`);
      return renderedTemplate;
    } catch (error) {
      this.logger.warn(`Could not load template ${templateName}, using fallback: ${error.message}`);
      return this.getFallbackTemplate(templateName, variables);
    }
  }

  private getFallbackTemplate(templateName: string, variables: Record<string, string>): string {
    switch (templateName) {
      case 'email-verification':
        return `
          <h2>Email Verification</h2>
          <p>Hello ${variables.firstName},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${variables.verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${variables.verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        `;
      case 'welcome':
        return `
          <h2>Welcome to GenAI LMS!</h2>
          <p>Hello ${variables.firstName},</p>
          <p>Welcome to our platform! Your email has been verified successfully.</p>
          <p>You can now access all features of our Learning Management System.</p>
          <a href="${variables.frontendUrl}/dashboard" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
        `;
      case 'password-reset':
        return `
          <h2>Password Reset Request</h2>
          <p>Hello ${variables.firstName},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${variables.resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p>${variables.resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `;
      case 'password-change-notification':
        return `
          <h2>Password Changed Successfully</h2>
          <p>Hello ${variables.firstName},</p>
          <p>Your password for account ${variables.email} has been changed successfully on ${variables.timestamp}.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>For your security, all active sessions have been logged out.</p>
        `;
      default:
        return `<p>Email content not available</p>`;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('email.from'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('app.frontendUrl')}/verify-email?token=${verificationToken}`;
    
    const html = this.loadTemplate('email-verification', {
      firstName,
      verificationUrl,
    });

    await this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    
    const html = this.loadTemplate('welcome', {
      firstName,
      frontendUrl,
    });

    await this.sendEmail({
      to,
      subject: 'Welcome to GenAI LMS!',
      html,
    });
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`;
    
    const html = this.loadTemplate('password-reset', {
      firstName,
      resetUrl,
    });

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Get available email templates for debugging
   */
  getAvailableTemplates(): string[] {
    return EmailTemplateLoader.getAvailableTemplates();
  }

  /**
   * Test template rendering without sending email
   */
  async testTemplate(templateName: string, variables: Record<string, any>): Promise<string> {
    try {
      return this.loadTemplate(templateName, variables);
    } catch (error) {
      this.logger.error(`Failed to test template ${templateName}:`, error);
      throw error;
    }
  }

  async sendPasswordChangeNotification(to: string, firstName: string): Promise<void> {
    const html = this.loadTemplate('password-change-notification', {
      firstName,
      email: to,
      timestamp: new Date().toLocaleString(),
    });

    await this.sendEmail({
      to,
      subject: 'Password Changed Successfully',
      html,
    });
  }
}
