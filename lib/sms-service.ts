/**
 * SMS Service
 * Supports multiple providers: Africa's Talking (best for Kenya), Twilio
 */

const provider = process.env.SMS_PROVIDER || 'africas-talking';

interface SMSOptions {
  phoneNumber: string;
  message: string;
}

/**
 * Format phone number to international format
 */
function formatPhoneNumber(phone: string): string {
  // Remove any spaces or dashes
  let clean = phone.replace(/[\s-]/g, '');

  // If starts with 0, replace with +254
  if (clean.startsWith('0')) {
    clean = '+254' + clean.slice(1);
  }

  // If doesn't start with +, add it
  if (!clean.startsWith('+')) {
    clean = '+' + clean;
  }

  return clean;
}

/**
 * Send SMS using configured provider
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    const formattedPhone = formatPhoneNumber(options.phoneNumber);

    if (provider === 'africas-talking') {
      return await sendSMSAfricasTalking(formattedPhone, options.message);
    } else if (provider === 'twilio') {
      return await sendSMSTwilio(formattedPhone, options.message);
    } else {
      console.warn(`SMS provider '${provider}' not configured, logging SMS instead`);
      logSMS(formattedPhone, options.message);
      return true;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send SMS via Africa's Talking
 */
async function sendSMSAfricasTalking(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const AfricasTalking = require('africastalking');

    const at = AfricasTalking({
      apiKey: process.env.AFRICAS_TALKING_API_KEY,
      username: process.env.AFRICAS_TALKING_USERNAME || 'YadplastStore',
    });

    const response = await at.SMS.send({
      to: [phoneNumber],
      message: message.substring(0, 160), // SMS max 160 chars
    });

    console.log('✅ SMS sent via Africa\'s Talking:', response);
    return true;
  } catch (error) {
    console.error('Africa\'s Talking error:', error);
    return false;
  }
}

/**
 * Send SMS via Twilio
 */
async function sendSMSTwilio(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const twilio = require('twilio');

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log('✅ SMS sent via Twilio:', response.sid);
    return true;
  } catch (error) {
    console.error('Twilio error:', error);
    return false;
  }
}

/**
 * Log SMS to console (for development)
 */
function logSMS(phoneNumber: string, message: string): void {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SMS (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${phoneNumber}
Message: ${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

/**
 * SMS message templates
 */

export function generateOrderConfirmationSMS(data: {
  orderId: string;
  total: number;
}): string {
  return `Yadplast: Order ${data.orderId} confirmed! Total: KES ${(data.total / 100).toFixed(2)}. You'll receive tracking info soon. Thank you!`;
}

export function generateOrderShippedSMS(data: {
  orderId: string;
  estimatedDelivery: string;
}): string {
  return `Yadplast: Your order ${data.orderId} has shipped! Expected delivery: ${data.estimatedDelivery}. Tracking info sent to email.`;
}

export function generateOrderDeliveredSMS(data: {
  orderId: string;
}): string {
  return `Yadplast: Your order ${data.orderId} has been delivered! Thank you for shopping with us. Share your experience in a review.`;
}

export function generatePromoSMS(data: {
  discount: number;
  code?: string;
}): string {
  const codeText = data.code ? ` Use code: ${data.code}` : '';
  return `Yadplast: Exclusive offer! Get ${data.discount}% off on all items today.${codeText} Limited time only!`;
}

export function generateLowStockAlertSMS(data: {
  productName: string;
}): string {
  return `Yadplast: ${data.productName} is running low on stock. Order now before it's gone!`;
}

export function generateReferralSMS(data: {
  referralCode: string;
  discount: number;
}): string {
  return `Yadplast: Share your referral code ${data.referralCode} with friends! Both of you get ${data.discount}% discount. Happy shopping!`;
}

export function generatePaymentReminderSMS(data: {
  orderId: string;
  amount: number;
}): string {
  return `Yadplast: Reminder - Your order ${data.orderId} is pending payment. Amount: KES ${(data.amount / 100).toFixed(2)}. Complete payment now.`;
}

export default {
  sendSMS,
  formatPhoneNumber,
  generateOrderConfirmationSMS,
  generateOrderShippedSMS,
  generateOrderDeliveredSMS,
  generatePromoSMS,
  generateLowStockAlertSMS,
  generateReferralSMS,
  generatePaymentReminderSMS,
};
