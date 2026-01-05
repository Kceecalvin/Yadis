'use client';
import Link from 'next/link';

interface CheckoutStepsProps {
  currentStep: number; // 1 = Login, 2 = Delivery, 3 = Payment
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { 
      number: 1, 
      label: 'Checkout',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      number: 2, 
      label: 'Delivery',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    { 
      number: 3, 
      label: 'Payment',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex items-center justify-center py-2 animate-fade-in">
      {steps.map((step, index) => (
        <div 
          key={step.number} 
          className="flex items-center animate-slide-up"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          {/* Step Circle and Label */}
          <div className={`flex flex-col items-center relative group ${step.number === 1 ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
            onClick={step.number === 1 ? () => window.location.href = '/cart' : undefined}>
            {/* Glow ring for active step */}
            {step.number === currentStep && (
              <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-xl animate-ping-slow"></div>
            )}
            
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all duration-500 border-2 shadow-md relative z-10 ${
                step.number === currentStep
                  ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-brand-primary shadow-2xl shadow-brand-primary/50 scale-110 animate-pulse-slow animate-rotate-slow'
                  : step.number < currentStep
                  ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30 animate-success-pop hover:shadow-xl hover:scale-105'
                  : 'bg-stone-100 text-stone-400 border-stone-300 hover:border-stone-400 hover:shadow-lg hover:scale-105 hover:rotate-6'
              }`}
              style={step.number === currentStep ? {
                boxShadow: '0 0 30px rgba(139, 69, 19, 0.4), 0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              } : {}}
            >
              {step.number < currentStep ? (
                <svg className="w-6 h-6 animate-check-draw" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className={step.number === currentStep ? 'animate-icon-bounce' : ''}>
                  {step.icon}
                </div>
              )}
            </div>
            <p
              className={`text-xs font-semibold mt-2 whitespace-nowrap transition-all duration-300 ${
                step.number === currentStep
                  ? 'text-brand-primary font-bold animate-text-glow'
                  : step.number < currentStep
                  ? 'text-green-600'
                  : 'text-stone-400 group-hover:text-stone-600'
              }`}
            >
              {step.label}
            </p>
          </div>

          {/* Connector Line with gradient animation */}
          {index < steps.length - 1 && (
            <div className="relative w-32 h-0.5 mx-8 overflow-hidden">
              {/* Background line */}
              <div className="absolute inset-0 bg-stone-300"></div>
              
              {/* Animated fill line */}
              <div
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  step.number < currentStep 
                    ? 'bg-gradient-to-r from-green-600 via-green-500 to-green-600 shadow-sm shadow-green-500/50 animate-line-fill' 
                    : 'w-0'
                }`}
                style={step.number < currentStep ? {
                  animation: 'shimmer 2s infinite, line-fill 0.8s ease-out forwards'
                } : {}}
              ></div>
              
              {/* Moving dot on active line */}
              {step.number < currentStep && (
                <div className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-dot-travel shadow-lg"></div>
              )}
            </div>
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes rotate-slow {
          0% { transform: rotate(0deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }
        
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0; }
        }
        
        @keyframes success-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes check-draw {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes line-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes dot-travel {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(139, 69, 19, 0.5); }
          50% { text-shadow: 0 0 20px rgba(139, 69, 19, 0.8); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-success-pop {
          animation: success-pop 0.6s ease-out;
        }
        
        .animate-check-draw {
          animation: check-draw 0.6s ease-out;
        }
        
        .animate-line-fill {
          animation: line-fill 0.8s ease-out forwards;
        }
        
        .animate-dot-travel {
          animation: dot-travel 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
        
        .animate-icon-bounce {
          animation: icon-bounce 1s ease-in-out infinite;
        }
        
        .animate-text-glow {
          animation: text-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
