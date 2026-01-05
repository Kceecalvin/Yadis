'use client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  bonusPoints: number;
  category: string;
  requirement?: number;
  earnedAt?: Date;
  currentProgress?: number;
  requiredProgress?: number;
  percentage?: number;
}

interface BadgeGridProps {
  earnedBadges: Badge[];
  nextBadges?: Badge[];
  showProgress?: boolean;
}

export default function BadgeGrid({ earnedBadges, nextBadges = [], showProgress = true }: BadgeGridProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-orange-400 to-orange-600';
      case 'SILVER': return 'from-gray-300 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'PLATINUM': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'shadow-orange-500/50';
      case 'SILVER': return 'shadow-gray-400/50';
      case 'GOLD': return 'shadow-yellow-500/50';
      case 'PLATINUM': return 'shadow-purple-500/50';
      default: return 'shadow-gray-400/50';
    }
  };

  return (
    <div className="space-y-8">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-brand-dark">
              🏅 Your Badges ({earnedBadges.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="group relative bg-white rounded-xl border-2 border-brand-accent/20 p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {/* Tier Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(badge.tier)} text-white text-xs font-bold`}>
                    {badge.tier}
                  </div>
                </div>

                {/* Badge Icon */}
                <div className="flex flex-col items-center mb-3">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTierColor(badge.tier)} flex items-center justify-center shadow-lg ${getTierGlow(badge.tier)} mb-3 group-hover:animate-pulse`}>
                    <span className="text-4xl">{badge.icon}</span>
                  </div>
                  <h4 className="font-bold text-brand-dark text-center text-sm mb-1">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-600 text-center line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Bonus Points */}
                {badge.bonusPoints > 0 && (
                  <div className="mt-2 pt-2 border-t border-brand-accent/20">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <span className="text-xs">+</span>
                      <span className="text-sm font-bold">{(badge.bonusPoints / 100).toLocaleString()}</span>
                      <span className="text-xs">KES</span>
                    </div>
                  </div>
                )}

                {/* Earned Date */}
                {badge.earnedAt && (
                  <div className="mt-2 text-center text-xs text-gray-400">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Badges to Earn */}
      {showProgress && nextBadges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-brand-dark">
              🎯 Next Challenges
            </h3>
            <span className="text-sm text-gray-600">Keep going!</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextBadges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-xl border-2 border-dashed border-brand-accent/40 p-4 hover:border-brand-primary transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Locked Badge Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center opacity-60">
                      <span className="text-3xl grayscale">{badge.icon}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-brand-dark text-sm">{badge.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(badge.tier)} text-white text-xs font-bold`}>
                        {badge.tier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{badge.description}</p>

                    {/* Progress Bar */}
                    {badge.percentage !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {badge.currentProgress?.toLocaleString()} / {badge.requiredProgress?.toLocaleString()}
                          </span>
                          <span className="font-bold text-brand-primary">{badge.percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(badge.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Reward Preview */}
                    {badge.bonusPoints > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-green-600 text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">+KES {(badge.bonusPoints / 100).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {earnedBadges.length === 0 && nextBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏅</div>
          <h3 className="text-xl font-bold text-brand-dark mb-2">No Badges Yet!</h3>
          <p className="text-gray-600">Complete orders and refer friends to earn your first badges!</p>
        </div>
      )}
    </div>
  );
}
