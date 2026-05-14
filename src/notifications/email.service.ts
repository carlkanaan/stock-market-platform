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

  async sendWalletCreditEmail(to: string, amount: number, balance: number) {
    await this.sendEmail(
      to,
      'Wallet Credited',
      `<p>Your wallet was credited with <strong>$${amount}</strong>.</p>
       <p>Your new balance is <strong>$${balance}</strong>.</p>`,
    );
  }

  async sendTradeExecutionEmail(
    to: string,
    type: string,
    quantity: number,
    stockName: string,
    totalValue: number,
  ) {
    await this.sendEmail(
      to,
      'Trade Executed',
      `<p>Your <strong>${type}</strong> order was executed.</p>
       <p>Stock: <strong>${stockName}</strong></p>
       <p>Quantity: <strong>${quantity}</strong></p>
       <p>Total value: <strong>$${totalValue}</strong></p>`,
    );
  }

  async sendPriceAlertEmail(
    to: string,
    stockName: string,
    currentPrice: number,
    targetPrice: number,
  ) {
    await this.sendEmail(
      to,
      'Price Alert Triggered',
      `<p>Your price alert for <strong>${stockName}</strong> was triggered.</p>
       <p>Current price: <strong>$${currentPrice}</strong></p>
       <p>Target price: <strong>$${targetPrice}</strong></p>`,
    );
  }

  async sendCmsProvisioningEmail(
    to: string,
    fullName: string,
    temporaryPassword: string,
  ) {
    await this.sendEmail(
      to,
      'CMS Account Created',
      `<p>Hello ${fullName},</p>
       <p>Your CMS account has been created.</p>
       <p>Password: <strong>${temporaryPassword}</strong></p>`,
    );
  }
}
