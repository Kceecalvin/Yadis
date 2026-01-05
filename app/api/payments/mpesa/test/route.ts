import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * POST /api/payments/mpesa/test
 * Test endpoint to verify M-Pesa credentials (no auth required)
 * DELETE THIS AFTER TESTING
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber = '0702987665', amount = 50000 } = await request.json();

    console.log('🧪 Testing M-Pesa credentials...');
    console.log('Phone:', phoneNumber);
    console.log('Amount:', amount);

    // Test 1: Get M-Pesa access token
    console.log('\n1️⃣  Testing M-Pesa authentication...');
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    try {
      const tokenResponse = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      console.log('✅ M-Pesa authentication successful');
      const accessToken = tokenResponse.data.access_token;

      // Test 2: Create STK push
      console.log('\n2️⃣  Creating STK push request...');
      
      // M-Pesa timestamp format: YYYYMMDDHHmmss
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

      const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // Format phone number
      const cleaned = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleaned.startsWith('0')
        ? `254${cleaned.substring(1)}`
        : cleaned.startsWith('254')
        ? cleaned
        : `254${cleaned}`;

      console.log('Formatted phone:', formattedPhone);
      console.log('Amount in KES:', Math.round(amount / 100));
      console.log('Shortcode:', process.env.MPESA_SHORTCODE);
      console.log('Timestamp:', timestamp);

      const stkPushResponse = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(amount / 100),
          PartyA: formattedPhone,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: `https://webhook.site/unique-id-here`, // Use a temporary webhook for testing
          AccountReference: 'TEST-ORDER',
          TransactionDesc: 'Test payment',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ STK push created successfully');
      console.log('Response:', stkPushResponse.data);

      return NextResponse.json(
        {
          success: true,
          message: 'M-Pesa test successful!',
          data: {
            checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
            merchantRequestId: stkPushResponse.data.MerchantRequestID,
            responseCode: stkPushResponse.data.ResponseCode,
            responseDescription: stkPushResponse.data.ResponseDescription,
          },
        },
        { status: 200 }
      );
    } catch (mpesaError: any) {
      console.error('❌ M-Pesa error:', mpesaError.response?.data || mpesaError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'M-Pesa request failed',
          details: mpesaError.response?.data?.error_description || mpesaError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
