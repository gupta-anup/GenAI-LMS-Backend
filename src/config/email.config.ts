import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM || process.env.MAIL_USER,
}));
