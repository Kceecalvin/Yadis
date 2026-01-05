'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getCart } from '@/lib/cart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BoltStyleMapPro from '@/app/components/BoltStyleMapPro';
import { calculateDeliveryFee, formatDeliveryFee } from '@/lib/deliveryFees';
import CheckoutSteps from '@/app/components/CheckoutSteps';
import SuccessModal from '@/app/components/SuccessModal';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // Start at login step
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cod' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    orderId: string;
    amount: number;
    type: 'mpesa' | 'order';
    rewardsMessage?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryBuilding: '',
    deliveryHouse: '',
    deliveryFloor: '',
    deliveryCity: '',
    deliveryNotes: '',
    deliveryMethod: 'delivery',
    deliveryLatitude: -0.6838,
    deliveryLongitude: 37.2675,
    deliveryFee: 0,
    isFreeDelivery: false,
    deliveryZone: 'Kutus - Sunrise Hostel Area'
  });
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);

  useEffect(() => {
    setCart(getCart());
  }, []);

  // Update step based on authentication status
  useEffect(() => {
    if (status === 'loading') {
      setCurrentStep(1); // Show login step while checking auth
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
    } else if (status === 'authenticated') {
      setCurrentStep(2); // Move to delivery step once authenticated
    }
  }, [status, router]);

  // Update step based on form completion
  useEffect(() => {
    if (status === 'authenticated') {
      // Check if delivery info is filled
      const hasDeliveryInfo = formData.deliveryAddress && formData.customerPhone;
      if (hasDeliveryInfo && currentStep === 2 && !isSubmitting) {
        // Stay on delivery step until form is submitted
        setCurrentStep(2);
      }
    }
  }, [formData, status, currentStep, isSubmitting]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    address?: string;
  }) => {
    // Calculate delivery fee based on distance
    const deliveryInfo = calculateDeliveryFee(location.lat, location.lng);
    
    setFormData({
      ...formData,
      deliveryLatitude: location.lat,
      deliveryLongitude: location.lng,
      deliveryAddress: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      deliveryFee: deliveryInfo.deliveryFee,
      isFreeDelivery: deliveryInfo.isFreeDelivery,
      deliveryZone: deliveryInfo.zone,
    });
    
    setDeliveryInfo(deliveryInfo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if delivery info is filled (basic validation)
    if (!formData.deliveryAddress || !formData.customerPhone) {
      setSubmitError('Please fill in all required delivery information');
      return;
    }
    
    // Move to payment step
    setCurrentStep(3);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare order items from cart
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        priceCents: Math.round(item.price * 100), // Convert to cents
      }));

      // Submit order
      const totalWithDelivery = totalAmount + (formData.deliveryMethod === 'delivery' ? formData.deliveryFee / 100 : 0);
      
      const orderData = {
        items,
        totalAmount: Math.round(totalWithDelivery * 100),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryBuilding: formData.deliveryBuilding,
        deliveryHouse: formData.deliveryHouse,
        deliveryFloor: formData.deliveryFloor,
        deliveryCity: formData.deliveryCity,
        deliveryNotes: formData.deliveryNotes,
        deliveryMethod: formData.deliveryMethod,
        deliveryLatitude: formData.deliveryLatitude,
        deliveryLongitude: formData.deliveryLongitude,
        deliveryFee: formData.deliveryFee,
        isFreeDelivery: formData.isFreeDelivery,
        deliveryZone: formData.deliveryZone,
      };
      
      console.log('Submitting order:', orderData);
      
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Order creation failed:', error);
        throw new Error(error.error || 'Failed to create order');
      }

      const result = await response.json();

      // If M-Pesa payment selected, initiate STK push
      if (paymentMethod === 'mpesa') {
        const mpesaPayload = {
          phoneNumber: formData.customerPhone.replace(/^0/, '254'), // Convert 07XX to 2547XX
          amount: result.order.totalCents,
          orderId: result.order.id,
          accountReference: `ORDER-${result.order.id}`,
          transactionDesc: `Payment for Order ${result.order.id}`,
        };
        
        console.log('Initiating M-Pesa payment:', mpesaPayload);
        
        const mpesaResponse = await fetch('/api/payments/mpesa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mpesaPayload),
        });

        if (!mpesaResponse.ok) {
          console.error('M-Pesa response status:', mpesaResponse.status);
          console.error('M-Pesa response statusText:', mpesaResponse.statusText);
          const responseText = await mpesaResponse.text();
          console.error('M-Pesa response body:', responseText);
          
          let errorMessage = 'Failed to initiate M-Pesa payment. Please try again.';
          try {
            const mpesaError = JSON.parse(responseText);
            errorMessage = mpesaError.details || mpesaError.error || errorMessage;
          } catch (e) {
            errorMessage = responseText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const mpesaResult = await mpesaResponse.json();
        
        // Show success modal for M-Pesa
        setSuccessData({
          orderId: result.order.id,
          amount: result.order.totalCents / 100,
          type: 'mpesa',
          rewardsMessage: result.rewards?.message,
        });
        setShowSuccessModal(true);
      } else {
        // Show success modal for other payment methods
        setSuccessData({
          orderId: result.order.id,
          amount: result.order.totalCents / 100,
          type: 'order',
          rewardsMessage: result.rewards?.message,
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      setCurrentStep(2); // Go back to delivery step on error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
          <p className="mt-4 text-brand-secondary">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <svg className="w-24 h-24 mx-auto mb-6 text-brand-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-brand-dark mb-3">Your cart is empty</h1>
        <p className="text-brand-secondary mb-8">Add some items to your cart to proceed with checkout</p>
        <Link href="/" className="inline-block px-8 py-3 bg-brand-primary text-white font-semibold rounded hover:bg-brand-secondary transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Floating Step Indicator */}
      <div className="mx-auto max-w-4xl px-4 pt-6 pb-6">
        <CheckoutSteps currentStep={currentStep} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-brand-accent/20 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
                  <h2 className="text-xl font-bold text-brand-dark">Contact Information</h2>
                  <p className="text-sm text-brand-secondary mt-1">We'll use this to reach you about your order</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                      placeholder="+254 700 000 000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-sm border border-brand-accent/20 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
                  <h2 className="text-xl font-bold text-brand-dark">Delivery Information</h2>
                  <p className="text-sm text-brand-secondary mt-1">Where should we deliver your order?</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Delivery Location Map */}
                  {formData.deliveryMethod === 'delivery' && (
                    <div>
                      <label className="block text-sm font-semibold text-brand-dark mb-3">
                        Select Delivery Location on Map <span className="text-red-500">*</span>
                      </label>
                      <div className="rounded-xl overflow-hidden border-2 border-brand-accent/20" style={{ height: '400px' }}>
                        <BoltStyleMapPro
                          mode="select"
                          onLocationSelect={handleLocationSelect}
                          deliveryLocation={{
                            lat: formData.deliveryLatitude,
                            lng: formData.deliveryLongitude,
                            address: formData.deliveryAddress
                          }}
                        />
                      </div>
                      {formData.deliveryLatitude && formData.deliveryLongitude && deliveryInfo && (
                        <div className={`mt-3 p-4 rounded-lg border-2 ${
                          deliveryInfo.isFreeDelivery 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              deliveryInfo.isFreeDelivery 
                                ? 'bg-green-100' 
                                : 'bg-blue-100'
                            }`}>
                              {deliveryInfo.isFreeDelivery ? (
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold text-lg ${
                                deliveryInfo.isFreeDelivery 
                                  ? 'text-green-800' 
                                  : 'text-blue-800'
                              }`}>
                                {deliveryInfo.isFreeDelivery ? '🎉 FREE Delivery!' : `Delivery: ${formatDeliveryFee(deliveryInfo.deliveryFee)}`}
                              </p>
                              <p className={`text-sm mt-1 ${
                                deliveryInfo.isFreeDelivery 
                                  ? 'text-green-700' 
                                  : 'text-blue-700'
                              }`}>
                                Distance: {deliveryInfo.distance.toFixed(2)} km from store
                              </p>
                              <p className={`text-xs mt-1 ${
                                deliveryInfo.isFreeDelivery 
                                  ? 'text-green-600' 
                                  : 'text-blue-600'
                              }`}>
                                Zone: {deliveryInfo.zone}
                              </p>
                              {!deliveryInfo.isFreeDelivery && (
                                <p className="text-xs mt-2 text-gray-600">
                                  💡 Base fee: KES 70 + KES 10 per km beyond free zone
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-brand-dark mb-2">
                      Delivery Method <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="deliveryMethod"
                      value={formData.deliveryMethod}
                      onChange={handleInputChange}
                      className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="delivery">Home Delivery</option>
                      <option value="pickup">Pick-up at Store</option>
                    </select>
                  </div>

                  {formData.deliveryMethod === 'delivery' && (
                    <div className="space-y-4 pt-4 border-t border-brand-accent/20">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-dark mb-2">
                            Building Name/Number <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            name="deliveryBuilding"
                            value={formData.deliveryBuilding}
                            onChange={handleInputChange}
                            className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="e.g., Kenyatta Plaza"
                            required={formData.deliveryMethod === 'delivery'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-dark mb-2">
                            House/Apartment Number <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="text"
                            name="deliveryHouse"
                            value={formData.deliveryHouse}
                            onChange={handleInputChange}
                            className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="e.g., Apt 4B or House 12"
                            required={formData.deliveryMethod === 'delivery'}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-dark mb-2">Street Address</label>
                          <input 
                            type="text"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleInputChange}
                            className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="e.g., Kimathi Street"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-dark mb-2">Floor</label>
                          <input 
                            type="text"
                            name="deliveryFloor"
                            value={formData.deliveryFloor}
                            onChange={handleInputChange}
                            className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                            placeholder="e.g., 4th Floor"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-brand-dark mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          name="deliveryCity"
                          value={formData.deliveryCity}
                          onChange={handleInputChange}
                          className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                          placeholder="e.g., Nairobi"
                          required={formData.deliveryMethod === 'delivery'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-brand-dark mb-2">Delivery Notes</label>
                        <textarea 
                          name="deliveryNotes"
                          value={formData.deliveryNotes}
                          onChange={handleInputChange}
                          className="w-full border border-brand-accent/30 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-none"
                          rows={3}
                          placeholder="Any special instructions? (e.g., call when you arrive, gate code, etc.)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-sm border border-brand-accent/20 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
                  <h2 className="text-xl font-bold text-brand-dark">Payment Method</h2>
                  <p className="text-sm text-brand-secondary mt-1">Choose how you'd like to pay</p>
                </div>
                <div className="p-6 space-y-3">
                  {/* M-Pesa */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      setPaymentMethod('mpesa');
                      // Trigger form submission after state is set
                      setTimeout(() => {
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 0);
                    }}
                    disabled={isSubmitting}
                    className="group w-full px-6 py-4 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-secondary transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                    </svg>
                    <span>M-Pesa</span>
                    <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Credit/Debit Card */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      setPaymentMethod('card');
                      setTimeout(() => {
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 0);
                    }}
                    disabled={isSubmitting}
                    className="group w-full px-6 py-4 rounded-lg bg-brand-secondary text-white font-semibold hover:bg-brand-dark transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-secondary"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Credit / Debit Card</span>
                    <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Cash on Delivery */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      setPaymentMethod('cod');
                      setTimeout(() => {
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 0);
                    }}
                    disabled={isSubmitting}
                    className="group w-full px-6 py-4 rounded-lg border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary hover:text-white transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-primary"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Pay on Delivery</span>
                    <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-brand-accent/20 overflow-hidden sticky top-4">
            <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 px-6 py-4 border-b border-brand-accent/20">
              <h2 className="text-xl font-bold text-brand-dark">Order Summary</h2>
              <p className="text-sm text-brand-secondary mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-brand-accent/10 last:border-0">
                    <div className="w-20 h-20 rounded overflow-hidden bg-brand-light flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-dark text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-brand-secondary">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-brand-primary mt-1">
                        KES {item.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-dark">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-brand-accent/20">
                <div className="flex justify-between text-brand-dark">
                  <span>Subtotal</span>
                  <span className="font-semibold">KES {totalAmount.toLocaleString()}</span>
                </div>
                {formData.deliveryMethod === 'delivery' && (
                  <>
                    <div className="flex justify-between text-brand-secondary">
                      <span>Delivery Fee ({formData.deliveryZone})</span>
                      <span className={`font-semibold ${formData.isFreeDelivery ? 'text-green-600' : 'text-blue-600'}`}>
                        {formData.isFreeDelivery ? 'FREE' : `KES ${(formData.deliveryFee / 100).toLocaleString()}`}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold text-brand-dark pt-3 border-t border-brand-accent/20">
                  <span>Total</span>
                  <span>
                    KES {(totalAmount + (formData.deliveryMethod === 'delivery' ? formData.deliveryFee / 100 : 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {formData.deliveryMethod === 'delivery' && (
                <div className={`mt-4 p-4 rounded border ${formData.isFreeDelivery ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${formData.isFreeDelivery ? 'text-green-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className={`text-sm ${formData.isFreeDelivery ? 'text-green-800' : 'text-blue-800'}`}>
                      <p className="font-semibold">{formData.isFreeDelivery ? 'Free Delivery' : 'Delivery Available'}</p>
                      <p className={`mt-0.5 ${formData.isFreeDelivery ? 'text-green-700' : 'text-blue-700'}`}>
                        {formData.isFreeDelivery 
                          ? `Enjoy free delivery to ${formData.deliveryZone}!` 
                          : `Delivery to ${formData.deliveryZone}: KES ${(formData.deliveryFee / 100).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Link 
                href="/cart" 
                className="mt-4 block text-center text-sm text-brand-primary hover:text-brand-secondary font-medium"
              >
                Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            // Clear cart and redirect after closing modal
            localStorage.removeItem('cart');
            router.push(`/orders/${successData.orderId}`);
          }}
          title={successData.type === 'mpesa' ? 'Order created!' : 'Order placed successfully!'}
          message={successData.type === 'mpesa' ? 'M-Pesa payment request sent' : 'Thank you for your purchase'}
          orderId={successData.orderId}
          amount={successData.amount}
          rewardsMessage={successData.rewardsMessage}
          type={successData.type}
        />
      )}
      </div>
    </div>
  );
}
