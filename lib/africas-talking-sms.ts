/**
 * Africa's Talking SMS Service
 * Sends SMS via Africa's Talking API
 */

interface SendSMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function sendSMSViaAfricastalking(
  phoneNumber: string,
  message: string
): Promise<SendSMSResponse> {
  try {
    const apiKey = process.env.AFRICAS_TALKING_API_KEY;
    const username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';

    if (!apiKey) {
      console.error('Africa\'s Talking API key not configured');
      return {
        success: false,
        message: 'SMS service not configured',
      };
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    console.log('📤 Sending SMS via Africa\'s Talking:', {
      to: formattedPhone,
      message: message.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
    });

    // Call Africa's Talking API
    const response = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'ApiKey': apiKey,
      },
      body: new URLSearchParams({
        username: username,
        to: formattedPhone,
        message: message,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Africa\'s Talking API Error:', data);
      return {
        success: false,
        message: 'Failed to send SMS',
        data,
      };
    }

    console.log('✅ SMS SENT SUCCESSFULLY:', {
      to: formattedPhone,
      messageId: data.SMSMessageData?.Recipients?.[0]?.messageId,
      status: data.SMSMessageData?.Recipients?.[0]?.status,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'SMS sent successfully',
      data,
    };
  } catch (error) {
    console.error('Error sending SMS via Africa\'s Talking:', error);
    return {
      success: false,
      message: 'Error sending SMS',
      data: error,
    };
  }
}

/**
 * Send OTP via SMS
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<SendSMSResponse> {
  const message = `Your Yaddis verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return sendSMSViaAfricastalking(phoneNumber, message);
}

/**
 * Send Sign-In Code via SMS
 */
export async function sendSignInCodeSMS(phoneNumber: string, code: string): Promise<SendSMSResponse> {
  const message = `Your Yaddis sign-in code is: ${code}. Valid for 10 minutes. Never share this code.`;
  return sendSMSViaAfricastalking(phoneNumber, message);
}

/**
 * Send Order Confirmation SMS
 */
export async function sendOrderConfirmationSMS(
  phoneNumber: string,
  orderId: string,
  total: number
): Promise<SendSMSResponse> {
  const message = `Order #${orderId} confirmed! Total: KES ${total}. You'll receive delivery updates via SMS. Thank you for shopping with Yaddis!`;
  return sendSMSViaAfricastalking(phoneNumber, message);
}

/**
 * Send Delivery Update SMS
 */
export async function sendDeliveryUpdateSMS(
  phoneNumber: string,
  orderId: string,
  status: string
): Promise<SendSMSResponse> {
  const message = `Order #${orderId}: ${status}. Track your order at yaddplast.store`;
  return sendSMSViaAfricastalking(phoneNumber, message);
}

/**
 * Send Promo SMS
 */
export async function sendPromoSMS(
  phoneNumber: string,
  promoCode: string,
  discount: number
): Promise<SendSMSResponse> {
  const message = `Exclusive offer! Use code ${promoCode} for ${discount}% off on Yaddis. Valid today only. Shop now!`;
  return sendSMSViaAfricastalking(phoneNumber, message);
}
