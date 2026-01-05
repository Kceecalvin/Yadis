import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import axios from 'axios';
import { prisma } from '@/lib/db';

/**
 * Helper: Get M-Pesa access token
 */
async function getMpesaAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get M-Pesa access token:', error);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

/**
 * Helper: Format phone number to international format
 */
function formatPhoneNumber(phone: string): string {
  // Remove any non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return `254${cleaned.substring(1)}`;
  }

  // If already has 254, keep as is
  if (cleaned.startsWith('254')) {
    return cleaned;
  }

  // Otherwise prepend 254
  return `254${cleaned}`;
}

/**
 * POST /api/payments/mpesa
 * Initiates an M-Pesa STK push payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { orderId, amount, phoneNumber } = await request.json();

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order or amount' },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Order does not belong to user' },
        { status: 403 }
      );
    }

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Convert KES to cents if needed
    const amountInKES = Math.round(amount / 100);

    // Create STK push request
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

    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amountInKES,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: 'https://downless-charlsie-incongruously.ngrok-free.com/api/payments/mpesa/callback',
        AccountReference: `ORDER-${orderId}`,
        TransactionDesc: `Payment for order ${orderId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('M-Pesa STK push successful:', stkPushResponse.data);
    
    // Store payment record
    let payment;
    try {
      payment = await prisma.payment.create({
        data: {
          orderId,
          method: 'MPESA',
          status: 'PENDING',
          amount: Math.round(amount),
          currency: 'KES',
          transactionId: stkPushResponse.data.CheckoutRequestID,
          metadata: {
            checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
            merchantRequestId: stkPushResponse.data.MerchantRequestID,
            phoneNumber: formattedPhone,
          },
        },
      });
      console.log('Payment record created:', payment.id);
    } catch (dbError) {
      console.error('Failed to create payment record:', dbError);
      throw new Error('Failed to save payment record: ' + (dbError instanceof Error ? dbError.message : 'Unknown error'));
    }

    if (!payment) {
      throw new Error('Payment record was not created');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'STK push sent to your phone',
        checkoutRequestId: stkPushResponse.data.CheckoutRequestID,
        merchantRequestId: stkPushResponse.data.MerchantRequestID,
        paymentId: payment.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('M-Pesa payment error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to initiate M-Pesa payment',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
