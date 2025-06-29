import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '587', 10),
  secure: (process.env.SMTP_SECURE || process.env.MAIL_SECURE) === 'true', // true for 465, false for other ports
  user: process.env.SMTP_USER || process.env.MAIL_USER,
  password: process.env.SMTP_PASS || process.env.MAIL_PASS,
  from: process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || process.env.MAIL_USER,
}));
