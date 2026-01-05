'use client';

interface LoadingScreenProps {
  title?: string;
  message?: string;
  steps?: string[];
}

export default function LoadingScreen({
  title = 'Loading',
  message = 'Please wait while we prepare your experience...',
  steps = ['Initializing', 'Processing', 'Finalizing'],
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, brand-primary 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Animated Logo Container */}
        <div className="mb-12">
          <div className="w-24 h-24 mx-auto relative mb-8">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary border-r-brand-primary animate-spin"></div>
            
            {/* Middle rotating ring (reverse) */}
            <div 
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-brand-secondary" 
              style={{ 
                animationDirection: 'reverse', 
                animationDuration: '1.5s',
                animation: 'spin 1.5s linear infinite reverse'
              }}
            ></div>

            {/* Inner pulsing ring */}
            <div className="absolute inset-4 rounded-full border-2 border-brand-accent/30 animate-pulse"></div>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm font-bold text-brand-primary animate-pulse">APP</div>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-brand-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Loading Title */}
        <h2 className="text-3xl font-bold text-brand-dark mb-3">{title}</h2>
        <p className="text-lg text-brand-secondary mb-10 max-w-md">{message}</p>

        {/* Progress Bar */}
        <div className="w-72 h-2 bg-gray-300 rounded-full overflow-hidden mx-auto mb-10">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary rounded-full"
            style={{
              animation: 'loading-progress 2s ease-in-out infinite',
            }}
          ></div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3 mb-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center justify-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className="w-2 h-2 bg-brand-primary rounded-full"
                    style={{
                      opacity: dot === idx % 3 ? 1 : 0.3,
                      animation: `pulse 1.5s ease-in-out ${dot * 0.15}s infinite`,
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-sm text-brand-secondary">{step}</span>
            </div>
          ))}
        </div>

        {/* Loading percentage (optional animation) */}
        <div className="text-xs text-brand-secondary/60">
          <span className="inline-block" style={{animation: 'fade-in-out 2s ease-in-out infinite'}}>
            Loading...
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes loading-progress {
          0% {
            width: 0%;
            opacity: 0.5;
          }
          50% {
            width: 100%;
            opacity: 1;
          }
          100% {
            width: 0%;
            opacity: 0.5;
          }
        }

        @keyframes fade-in-out {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
