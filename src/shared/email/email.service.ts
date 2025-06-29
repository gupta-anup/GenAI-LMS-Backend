import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
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

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('email.from'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info(`Email sent successfully to ${options.to}`, 'EmailService');
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
        error.stack,
        'EmailService',
      );
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const subject = 'Welcome to Our Platform!';
    const html = this.getWelcomeEmailTemplate(firstName);
    
    await this.sendEmail({ to, subject, html });
  }

  async sendEmailVerification(
    to: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const subject = 'Please verify your email address';
    const verificationUrl = `${this.configService.get<string>('app.frontendUrl')}/verify-email?token=${verificationToken}`;
    const html = this.getEmailVerificationTemplate(firstName, verificationUrl);
    
    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordReset(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const subject = 'Password Reset Request';
    const resetUrl = `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`;
    const html = this.getPasswordResetTemplate(firstName, resetUrl);
    
    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordChangeNotification(
    to: string,
    firstName: string,
  ): Promise<void> {
    const subject = 'Password Changed Successfully';
    const html = this.getPasswordChangeNotificationTemplate(firstName);
    
    await this.sendEmail({ to, subject, html });
  }

  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; text-align: center; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Platform!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Welcome to our platform! We're excited to have you on board.</p>
              <p>You can now start using all our features and services.</p>
              <p>If you have any questions, don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; text-align: center; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="btn">Verify Email</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; text-align: center; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .btn { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>You requested a password reset. Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Password</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordChangeNotificationTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #17a2b8; color: white; text-align: center; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Your password has been successfully changed.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
              <p>Best regards,<br>The Security Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
