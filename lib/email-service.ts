/**
 * Email Service
 * Supports multiple providers: Resend (recommended), SendGrid, Mailtrap
 */

import { Resend } from 'resend';

const provider = process.env.EMAIL_PROVIDER || 'resend';
let emailClient: any;

// Initialize based on provider
if (provider === 'resend') {
  emailClient = new Resend(process.env.RESEND_API_KEY);
} else if (provider === 'sendgrid') {
  // SendGrid will be initialized separately
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (provider === 'resend') {
      return await sendEmailResend(options);
    } else if (provider === 'sendgrid') {
      return await sendEmailSendGrid(options);
    } else {
      console.warn(`Email provider '${provider}' not configured, logging email instead`);
      logEmail(options);
      return true;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send email via Resend
 */
async function sendEmailResend(options: EmailOptions): Promise<boolean> {
  try {
    const response = await emailClient.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@yadplast.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('✅ Email sent via Resend:', response.id);
    return true;
  } catch (error) {
    console.error('Resend error:', error);
    return false;
  }
}

/**
 * Send email via SendGrid
 */
async function sendEmailSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: options.to,
      from: process.env.EMAIL_FROM || 'noreply@yadplast.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('✅ Email sent via SendGrid');
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

/**
 * Log email to console (for development)
 */
function logEmail(options: EmailOptions): void {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${options.to}
Subject: ${options.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${options.html}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

/**
 * Email templates
 */

export function generateOrderConfirmationEmail(orderData: {
  orderId: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.price / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center;">✅ Order Confirmed</h1>
          
          <p style="color: #666; font-size: 16px;">
            Hi ${orderData.customerName},
          </p>
          
          <p style="color: #666;">
            Thank you for your order! We're preparing your items for shipment.
          </p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            
            <table style="width: 100%; margin: 15px 0;">
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <h3 style="text-align: right; color: #333;">
              Total: KES ${(orderData.total / 100).toFixed(2)}
            </h3>
          </div>
          
          <p style="color: #666;">
            You'll receive tracking information via SMS/Email once your order ships.
          </p>
          
          <p style="color: #666;">
            Questions? Contact us at support@yadplast.com
          </p>
          
          <footer style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            © 2025 Yadplast. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  `;
}

export function generateOrderShippedEmail(orderData: {
  orderId: string;
  customerName: string;
  estimatedDelivery: string;
  trackingUrl?: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center;">📦 Your Order Has Shipped!</h1>
          
          <p style="color: #666; font-size: 16px;">
            Hi ${orderData.customerName},
          </p>
          
          <p style="color: #666;">
            Great news! Your order is on its way.
          </p>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #4CAF50;">Order ID: ${orderData.orderId}</h3>
            <p style="color: #666;">
              <strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}
            </p>
            ${orderData.trackingUrl ? `
              <p style="margin-top: 15px;">
                <a href="${orderData.trackingUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  📍 Track Your Package
                </a>
              </p>
            ` : ''}
          </div>
          
          <footer style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            © 2025 Yadplast. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  `;
}

export function generateOrderDeliveredEmail(orderData: {
  orderId: string;
  customerName: string;
}): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center;">🎉 Order Delivered!</h1>
          
          <p style="color: #666; font-size: 16px;">
            Hi ${orderData.customerName},
          </p>
          
          <p style="color: #666;">
            Your order has been delivered successfully. We hope you enjoy your purchase!
          </p>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #4CAF50;">Order ID: ${orderData.orderId}</h3>
            <p style="color: #666;">
              Thank you for shopping with Yadplast!
            </p>
          </div>
          
          <p style="color: #666;">
            <strong>Have feedback?</strong> We'd love to hear from you. Reply to this email or leave a review on our platform.
          </p>
          
          <footer style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            © 2025 Yadplast. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  `;
}

export default {
  sendEmail,
  generateOrderConfirmationEmail,
  generateOrderShippedEmail,
  generateOrderDeliveredEmail,
};
