'use client';

import { useState } from 'react';

interface SpinWheelProps {
  rewards: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    probability: number;
  }>;
  onSpin: () => Promise<any>;
  spinsAvailable: number;
  onSpinComplete?: (result: any) => void;
}

export default function SpinWheel({ rewards, onSpin, spinsAvailable, onSpinComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSpin = async () => {
    if (isSpinning || spinsAvailable <= 0) return;

    setIsSpinning(true);
    setShowResult(false);

    try {
      // Call API to get result
      const spinResult = await onSpin();
      
      if (spinResult.success) {
        // Calculate which segment won
        const winningReward = rewards.find(r => r.name === spinResult.reward.name);
        const rewardIndex = rewards.indexOf(winningReward!);
        const segmentAngle = 360 / rewards.length;
        
        // Calculate final rotation (multiple spins + landing on winner)
        const finalRotation = 360 * 5 + (360 - (rewardIndex * segmentAngle)) - (segmentAngle / 2);
        
        setRotation(rotation + finalRotation);
        
        // Show result after animation
        setTimeout(() => {
          setResult(spinResult);
          setShowResult(true);
          setIsSpinning(false);
          onSpinComplete?.(spinResult);
        }, 4000);
      }
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
      alert('Failed to spin. Please try again.');
    }
  };

  const segmentAngle = 360 / rewards.length;

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-80 h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-brand-primary drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <div 
          className="relative w-full h-full rounded-full shadow-2xl overflow-hidden border-8 border-brand-primary"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {rewards.map((reward, index) => {
            const angle = index * segmentAngle;
            return (
              <div
                key={reward.id}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.tan((segmentAngle * Math.PI) / 360) * 50}% 0%)`,
                  backgroundColor: reward.color,
                  transformOrigin: 'center'
                }}
              >
                <div 
                  className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
                  style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                >
                  <span className="text-3xl mb-1">{reward.icon}</span>
                  <span className="text-xs font-bold text-white text-center px-1 drop-shadow-md">
                    {reward.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-brand-primary flex items-center justify-center shadow-lg z-10">
            <span className="text-2xl font-bold text-brand-primary">SPIN</span>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || spinsAvailable <= 0}
        className={`mt-8 px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          isSpinning || spinsAvailable <= 0
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-xl hover:scale-105 animate-pulse'
        }`}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Spinning...
          </span>
        ) : spinsAvailable <= 0 ? (
          'No Spins Available'
        ) : (
          `SPIN NOW (${spinsAvailable} ${spinsAvailable === 1 ? 'spin' : 'spins'} left)`
        )}
      </button>

      {/* Result Modal */}
      {showResult && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            {/* Confetti Effect */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">{result.reward.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">🎉 YOU WON! 🎉</h2>
              <div className="text-2xl font-bold text-yellow-400 mb-2">{result.reward.name}</div>
              <p className="text-white/80">{result.reward.description}</p>
            </div>

            {/* Reward Details */}
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Reward Value:</span>
                <span className="text-white font-bold text-xl">
                  {result.reward.type === 'POINTS' 
                    ? `KES ${(result.reward.value / 100).toLocaleString()}` 
                    : result.reward.type === 'DISCOUNT'
                    ? `${result.reward.value}% OFF`
                    : 'Free Delivery'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowResult(false);
                setResult(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}
