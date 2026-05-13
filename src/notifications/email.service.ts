import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const from = process.env.EMAIL_FROM;

    if (!from) {
      throw new Error('EMAIL_FROM is missing');
    }

    await sgMail.send({
      to,
      from,
      subject,
      html,
    });
  }

  async sendOtpEmail(to: string, otpCode: string) {
    await this.sendEmail(
      to,
      'Your OTP Code',
      `<p>Your verification code is <strong>${otpCode}</strong>.</p>
       <p>This code expires in 10 minutes.</p>`,
    );
  }
}
