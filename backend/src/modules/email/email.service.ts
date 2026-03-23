import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.from = configService.get('MAIL_FROM', 'noreply@tokdig.com');
    this.isEnabled = configService.get('MAIL_ENABLED') === 'true';
  }

  async send(options: EmailOptions): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug(`[DEV] Email to ${options.to}: ${options.subject}`);
      this.logger.debug(`[DEV] Body: ${options.html.slice(0, 200)}...`);
      return;
    }

    // In production, integrate with nodemailer, resend, or AWS SES
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({ from: this.from, ...options });

    this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
  }

  // ─── TEMPLATE HELPERS ─────────────────────────────────

  async sendOrderConfirmation(email: string, data: {
    orderNumber: string;
    productName: string;
    totalPrice: number;
    paymentUrl?: string;
  }) {
    await this.send({
      to: email,
      subject: `Pesanan ${data.orderNumber} — Menunggu Pembayaran`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6C5CE7;">TokDig — Konfirmasi Pesanan</h2>
          <p>Halo! Terima kasih atas pesanan Anda.</p>
          <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>No. Pesanan:</strong> ${data.orderNumber}</p>
            <p><strong>Produk:</strong> ${data.productName}</p>
            <p><strong>Total:</strong> Rp${data.totalPrice.toLocaleString('id-ID')}</p>
          </div>
          ${data.paymentUrl ? `<p><a href="${data.paymentUrl}" style="background:#6C5CE7;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Bayar Sekarang</a></p>` : ''}
          <p style="color:#999;font-size:12px;">Email ini dikirim otomatis, jangan dibalas.</p>
        </div>
      `,
    });
  }

  async sendPaymentSuccess(email: string, data: {
    orderNumber: string;
    productName: string;
  }) {
    await this.send({
      to: email,
      subject: `Pembayaran Berhasil — ${data.orderNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6C5CE7;">TokDig — Pembayaran Berhasil ✅</h2>
          <p>Pembayaran untuk pesanan <strong>${data.orderNumber}</strong> telah berhasil.</p>
          <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Produk:</strong> ${data.productName}</p>
            <p>Pesanan Anda sedang diproses dan akan segera dikirim.</p>
          </div>
          <p style="color:#999;font-size:12px;">Email ini dikirim otomatis, jangan dibalas.</p>
        </div>
      `,
    });
  }

  async sendResetPassword(email: string, resetUrl: string) {
    await this.send({
      to: email,
      subject: 'Reset Password — TokDig',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6C5CE7;">TokDig — Reset Password</h2>
          <p>Anda menerima email ini karena ada permintaan reset password.</p>
          <p><a href="${resetUrl}" style="background:#6C5CE7;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></p>
          <p style="color:#999;font-size:12px;">Link berlaku selama 1 jam. Jika Anda tidak meminta reset, abaikan email ini.</p>
        </div>
      `,
    });
  }

  async sendDeliveryNotification(email: string, data: {
    orderNumber: string;
    productName: string;
  }) {
    await this.send({
      to: email,
      subject: `Produk Dikirim — ${data.orderNumber}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6C5CE7;">TokDig — Produk Telah Dikirim 📦</h2>
          <p>Produk <strong>${data.productName}</strong> dari pesanan <strong>${data.orderNumber}</strong> telah dikirim ke Anda.</p>
          <p><a href="${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard/products" style="background:#6C5CE7;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Lihat Produk Saya</a></p>
          <p style="color:#999;font-size:12px;">Email ini dikirim otomatis, jangan dibalas.</p>
        </div>
      `,
    });
  }
}
