'use client';

interface OrderTrackerProps {
  currentStatus: string;
  confirmedAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  estimatedDeliveryDate?: Date | null;
}

export default function OrderTracker({
  currentStatus,
  confirmedAt,
  shippedAt,
  deliveredAt,
  estimatedDeliveryDate,
}: OrderTrackerProps) {
  const statuses = [
    {
      key: 'PENDING',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'CONFIRMED',
      label: 'Confirmed',
      description: 'Order confirmed and being prepared',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      timestamp: confirmedAt,
    },
    {
      key: 'SHIPPED',
      label: 'Out for Delivery',
      description: 'Order is on its way',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      timestamp: shippedAt,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Order has been delivered',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      timestamp: deliveredAt,
    },
  ];

  const getCurrentStepIndex = () => {
    const index = statuses.findIndex((s) => s.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const formatDate = (date?: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Tracking</h3>

      {/* Timeline */}
      <div className="relative">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === statuses.length - 1;

          return (
            <div key={status.key} className="relative flex items-start mb-8 last:mb-0">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-full -ml-px transition-all duration-500 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></div>
              )}

              {/* Icon Circle */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg scale-110 animate-pulse-slow'
                      : isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {status.icon}
                </div>
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4
                      className={`text-lg font-semibold transition-colors ${
                        isCurrent
                          ? 'text-brand-primary'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {status.label}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{status.description}</p>
                    {status.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(status.timestamp)}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  {isCurrent && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      In Progress
                    </span>
                  )}
                  {isCompleted && !isCurrent && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {estimatedDeliveryDate && currentStatus !== 'DELIVERED' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">Estimated Delivery</p>
              <p className="text-sm text-blue-700">
                {new Date(estimatedDeliveryDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivered Message */}
      {currentStatus === 'DELIVERED' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-semibold text-green-900">
              Your order has been delivered successfully!
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
