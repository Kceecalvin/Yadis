'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      console.log('Status: loading...');
      return;
    }

    if (!session?.user) {
      console.log('No session, redirecting to signin');
      router.push('/auth/signin');
      return;
    }

    // For now, just redirect to home and let user navigate to admin manually
    // TODO: Fix admin auto-redirect after proper session setup
    console.log('Redirecting to home page');
    router.push('/');
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-brand-secondary">Redirecting...</p>
      </div>
    </div>
  );
}
