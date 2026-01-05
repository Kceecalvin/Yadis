'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PointsData {
  total: number;
  available: number;
  used: number;
}

export default function PointsBalance() {
  const [points, setPoints] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/gamification/points');
      const data = await response.json();
      if (data.success) {
        setPoints(data.points);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-white/20 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-1/3"></div>
      </div>
    );
  }

  if (!points) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/80 mb-1">Your Points Balance</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-5xl font-bold animate-fade-in">{points.available.toLocaleString()}</h2>
          <span className="text-lg font-medium text-white/80">points</span>
        </div>
        <p className="text-sm text-white/70 mt-2">
          Lifetime: {points.total.toLocaleString()} | Used: {points.used.toLocaleString()}
        </p>
      </div>
      <Link
        href="/rewards"
        className="px-6 py-3 bg-white text-brand-primary rounded-lg font-semibold hover:bg-brand-light transition-all shadow-md flex items-center gap-2 group"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        Rewards Store
      </Link>
    </div>
  );
}
