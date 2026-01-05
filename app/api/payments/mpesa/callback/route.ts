import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/payments/mpesa/callback
 * M-Pesa callback handler for payment confirmations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    // Extract callback data
    const { Body } = body;
    const { stkCallback } = Body;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find payment by checkout request ID
    const payment = await prisma.payment.findFirst({
      where: {
        metadata: {
          path: ['checkoutRequestId'],
          equals: CheckoutRequestID,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      console.warn(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return NextResponse.json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check if payment was successful (ResultCode 0 = success)
    if (ResultCode === 0) {
      // Extract transaction details from callback metadata
      let mpesaReceiptNumber = '';
      let transactionDate = '';
      let transactionAmount = 0;

      if (CallbackMetadata?.Item) {
        const items = CallbackMetadata.Item;
        items.forEach((item: any) => {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === 'TransactionDate') {
            transactionDate = item.Value;
          } else if (item.Name === 'Amount') {
            transactionAmount = item.Value;
          }
        });
      }

      // Update payment as completed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          metadata: {
            ...payment.metadata,
            mpesaReceiptNumber,
            transactionDate,
            transactionAmount,
          },
        },
      });

      // Update order status to PAID
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
        },
      });

      console.log(`Payment ${payment.id} completed with receipt: ${mpesaReceiptNumber}`);

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed',
      });
    } else {
      // Payment failed or was cancelled
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...payment.metadata,
            resultCode: ResultCode,
            resultDescription: ResultDesc,
          },
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAYMENT_FAILED',
          paymentStatus: 'FAILED',
        },
      });

      console.log(
        `Payment ${payment.id} failed with result code: ${ResultCode}, description: ${ResultDesc}`
      );

      return NextResponse.json({
        success: false,
        message: `Payment failed: ${ResultDesc}`,
      });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
