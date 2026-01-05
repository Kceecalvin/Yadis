'use client';

import { useState } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Pay instantly using M-Pesa',
    icon: '📱',
    enabled: true,
  },
  {
    id: 'stripe',
    name: 'Card Payment',
    description: 'Credit or debit card via Stripe',
    icon: '💳',
    enabled: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: '💵',
    enabled: true,
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  amount: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  amount,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-accent/20 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
        <h2 className="text-xl font-bold text-brand-dark">Payment Method</h2>
        <p className="text-sm text-brand-secondary mt-1">Select how you want to pay</p>
      </div>

      <div className="p-6 space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <label key={method.id} className="flex items-center p-4 border border-brand-accent/20 rounded-lg cursor-pointer hover:bg-brand-primary/5 transition-colors" style={{
            backgroundColor: selectedMethod === method.id ? '#f5f0eb' : 'transparent',
            borderColor: selectedMethod === method.id ? '#8b6f47' : undefined,
          }}>
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onMethodChange(e.target.value)}
              className="w-4 h-4 accent-brand-primary"
            />
            <div className="ml-4 flex-1">
              <div className="text-lg font-semibold text-brand-dark">
                <span className="mr-2">{method.icon}</span>
                {method.name}
              </div>
              <div className="text-sm text-brand-secondary">{method.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Payment Summary */}
      <div className="bg-brand-primary/5 border-t border-brand-accent/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <span className="text-brand-secondary font-medium">Total Amount to Pay:</span>
          <span className="text-2xl font-bold text-brand-primary">
            KES {(amount / 100).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
