/**
 * Email Templates for YaddPlast Store
 * HTML email templates for various order notifications
 */

export interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  deliveryFee: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress?: string;
  deliveryZone?: string;
  estimatedDelivery?: string;
}

/**
 * Order Confirmation Email Template
 */
export function generateOrderConfirmationEmail(data: OrderData): string {
  const subtotal = data.total - data.deliveryFee;
  const items = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - YaddPlast</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Thank you for shopping with YaddPlast</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px;">
          <h2 style="color: #667eea; font-size: 18px; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> #${data.orderId}</p>
          <p><strong>Customer Name:</strong> ${data.customerName}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-KE')}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
            <thead>
              <tr style="background: #f0f0f0; border-bottom: 2px solid #667eea;">
                <th style="padding: 12px; text-align: left; font-weight: bold;">Product</th>
                <th style="padding: 12px; text-align: center; font-weight: bold;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: bold;">Price</th>
              </tr>
            </thead>
            <tbody>${items}</tbody>
          </table>
          <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <strong>KES ${subtotal.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
              <span>Delivery Fee (${data.deliveryZone}):</span>
              <strong>${data.deliveryFee === 0 ? 'FREE' : 'KES ' + data.deliveryFee.toLocaleString()}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px;">
              <span><strong>Total:</strong></span>
              <strong style="color: #667eea;">KES ${data.total.toLocaleString()}</strong>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${data.orderId}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Track Your Order</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0;">YaddPlast - Best Siku Zote</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Order Shipped Email Template
 */
export function generateOrderShippedEmail(data: OrderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped - YaddPlast</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Package Shipped!</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Your order is on its way</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px;">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order <strong>#${data.orderId}</strong> has been shipped.</p>
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #f5576c; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #f5576c;">Estimated Delivery</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${data.estimatedDelivery || 'Within 24 hours'}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${data.orderId}" style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Track Package</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0;">YaddPlast - Best Siku Zote</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Order Delivered Email Template
 */
export function generateOrderDeliveredEmail(data: OrderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered - YaddPlast</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Order Delivered!</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">We hope you enjoy your purchase</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px;">
          <p>Hi ${data.customerName},</p>
          <p>Your order <strong>#${data.orderId}</strong> has been successfully delivered!</p>
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #84fab0; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px;">Thank you for your purchase!</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reviews/new?orderId=${data.orderId}" style="background: #84fab0; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Share Your Review</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0;">YaddPlast - Best Siku Zote</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Welcome Email Template (New User Sign Up)
 */
export function generateWelcomeEmail(data: { customerName: string; customerEmail: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to YaddPlast - Best Siku Zote!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to YaddPlast!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Best Siku Zote</p>
        </div>
        <div style="background: #f9f9f9; padding: 40px;">
          <p style="font-size: 18px;">Hi ${data.customerName},</p>
          
          <p style="font-size: 16px; line-height: 1.8;">We're thrilled to have you join the YaddPlast family! 🎊</p>

          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #667eea;">🌟 What You Can Do Now:</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
              <li style="margin: 10px 0;">Browse our amazing selection of products</li>
              <li style="margin: 10px 0;">Enjoy fast delivery across Kutus and Nairobi</li>
              <li style="margin: 10px 0;">Get real-time delivery tracking</li>
              <li style="margin: 10px 0;">Receive exclusive offers and promotions</li>
              <li style="margin: 10px 0;">Track your orders anytime</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="background: #667eea; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Start Shopping Now</a>
          </div>

          <div style="background: #e8f4f8; padding: 20px; border-radius: 6px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #0066cc;">💝 First Order Special</h3>
            <p style="margin: 10px 0 0 0;">Use code <strong>WELCOME10</strong> at checkout for 10% off your first order!</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions, feel free to reach out to our support team at support@yaddplast.com</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0;">YaddPlast - Best Siku Zote</p>
          <p style="margin: 5px 0 0 0;">Your go-to store for quality products delivered fast!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Promotional Email Template (Admin Campaigns)
 */
export function generatePromoEmail(data: {
  recipientName: string;
  title: string;
  message: string;
  promoCode?: string;
  discount?: number;
  validUntil?: string;
  productImage?: string;
  ctaText?: string;
  ctaLink?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title} - YaddPlast</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">✨ ${data.title}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px;">
          <p style="font-size: 18px;">Hi ${data.recipientName},</p>
          
          <p style="font-size: 16px; line-height: 1.8;">${data.message}</p>

          ${
            data.productImage
              ? `<img src="${data.productImage}" alt="Promotion" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0;">`
              : ''
          }

          ${
            data.discount || data.promoCode
              ? `
            <div style="background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">EXCLUSIVE OFFER</p>
              <h2 style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">
                ${data.discount ? data.discount + '% OFF' : 'Special Deal'}
              </h2>
              ${
                data.promoCode
                  ? `<p style="margin: 15px 0 0 0; font-size: 18px; font-family: monospace; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; letter-spacing: 2px;"><strong>${data.promoCode}</strong></p>`
                  : ''
              }
              ${data.validUntil ? `<p style="margin: 10px 0 0 0; font-size: 12px;">Valid until: ${data.validUntil}</p>` : ''}
            </div>
          `
              : ''
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.ctaLink || process.env.NEXT_PUBLIC_SITE_URL}" style="background: #f5576c; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              ${data.ctaText || 'Shop Now'}
            </a>
          </div>

          <p style="color: #666; font-size: 13px; margin-top: 30px; text-align: center;">
            This is a promotional offer from YaddPlast. 
            <br>Hurry, offer is for a limited time only!
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p style="margin: 0;">YaddPlast - Best Siku Zote</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
