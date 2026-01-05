'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CompleteSignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const completeSignup = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        // Check for pending referral code
        const referralCode = localStorage.getItem('pendingReferralCode');
        
        if (referralCode) {
          try {
            console.log('Applying referral code:', referralCode);
            
            // Apply referral code
            const response = await fetch('/api/referral/apply-post-signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ referralCode }),
            });
            
            const data = await response.json();
            console.log('Referral code response:', data);
            
            if (data.success) {
              // Show success message
              alert('Welcome! Referral bonus applied - you\'ll earn points on your first purchase!');
            }
            
            // Clear from localStorage
            localStorage.removeItem('pendingReferralCode');
          } catch (error) {
            console.error('Error applying referral code:', error);
          }
        }
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    };

    if (status !== 'loading') {
      completeSignup();
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mx-auto mb-4"></div>
        <p className="text-brand-secondary">Completing your signup...</p>
      </div>
    </div>
  );
}
