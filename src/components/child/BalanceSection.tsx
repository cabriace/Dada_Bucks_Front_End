/**
 * BalanceSection Component (Child View)
 * 
 * Shows:
 * - Large animated Dada Bucks balance
 * - Pending earnings (waiting for 10 PM)
 * - Today's earnings summary
 * - Progress toward goals
 * - Strike warning (if applicable)
 */

import { useDadaStore } from '@/store/dadaStore';
import { MAX_STRIKES, RESET_HOUR } from '@/types';
import { TrendingUp, AlertTriangle, Star, Moon, PiggyBank } from 'lucide-react';

export function BalanceSection() {
  const { 
    children, 
    currentChildId,
    strikes, 
    getTodayStats,
    getNextResetTime 
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];
  
  if (!child) return null;

  const todayStats = getTodayStats();
  const todayStrikes = strikes.filter(s => 
    s.day === new Date().toISOString().split('T')[0] && s.childId === child.id
  ).length;
  
  const canEarn = todayStrikes < MAX_STRIKES;
  const progressPercent = Math.min((child.balance / 100) * 100, 100);
  
  // Format next reset time
  const nextReset = getNextResetTime();
  const resetTimeString = nextReset.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="dada-card dada-card-yellow p-8 text-center relative overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute top-4 left-4 text-4xl animate-float">⭐</div>
        <div className="absolute top-8 right-8 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-4 left-8 text-2xl animate-float" style={{ animationDelay: '2s' }}>💫</div>
        
        <p className="dada-label mb-4">Your Dada Bucks</p>
        
        {/* Big Balance Number */}
        <div className="balance-display text-[#1A1A2E] mb-4">
          {child.balance}
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-xs mx-auto">
          <div className="dada-progress">
            <div 
              className="dada-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-[#6B6B8C] font-bold mt-2">
            {progressPercent >= 100 ? '🎉 Goal reached!' : `Keep saving! (${Math.round(progressPercent)}%)`}
          </p>
        </div>
      </div>

      {/* Pending Earnings Banner */}
      {child.pendingEarnings > 0 && (
        <div className="dada-card bg-[#FFF6D6] p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD200] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
              <Moon className="w-6 h-6 text-[#1A1A2E]" />
            </div>
            <div className="flex-1">
              <p className="font-black text-[#1A1A2E]">
                {child.pendingEarnings} Dada Bucks Coming!
              </p>
              <p className="text-sm text-[#6B6B8C] font-bold">
                Will be added at {resetTimeString} ({RESET_HOUR}:00 PM)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Earnings */}
        <div className="dada-card dada-card-mint p-6 text-center">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
            <TrendingUp className="w-7 h-7 text-[#15803d]" />
          </div>
          <p className="dada-label mb-1">Earned Today</p>
          <p className="text-4xl font-black text-[#15803d]">+{todayStats.earned}</p>
        </div>

        {/* Strikes */}
        <div className={`dada-card p-6 text-center ${todayStrikes > 0 ? 'bg-[#FFB8D0]' : 'bg-white'}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E] ${todayStrikes > 0 ? 'bg-[#FF6A3D]' : 'bg-white'}`}>
            <AlertTriangle className={`w-7 h-7 ${todayStrikes > 0 ? 'text-white' : 'text-[#1A1A2E]'}`} />
          </div>
          <p className="dada-label mb-1">Strikes</p>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-4xl font-black ${todayStrikes >= MAX_STRIKES ? 'text-[#FF6A3D]' : 'text-[#1A1A2E]'}`}>
              {todayStrikes}
            </p>
            <span className="text-xl text-[#6B6B8C] font-bold">/ {MAX_STRIKES}</span>
          </div>
        </div>
      </div>

      {/* Strike Warning */}
      {todayStrikes > 0 && todayStrikes < MAX_STRIKES && (
        <div className="dada-card bg-[#FFD200] p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#1A1A2E] flex-shrink-0" />
            <div>
              <p className="font-black text-[#1A1A2E]">
                Careful! You have {todayStrikes} strike{todayStrikes !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-[#1A1A2E] font-bold">
                {MAX_STRIKES - todayStrikes} more and you lose pending earnings!
              </p>
            </div>
          </div>
        </div>
      )}

      {todayStrikes >= MAX_STRIKES && (
        <div className="dada-card bg-[#FF6A3D] p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-white flex-shrink-0" />
            <div>
              <p className="font-black text-white uppercase">
                Earnings Locked!
              </p>
              <p className="text-sm text-white/90 font-bold">
                You got {MAX_STRIKES} strikes. Try again tomorrow!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement */}
      {canEarn && todayStrikes === 0 && (
        <div className="dada-card bg-white p-6 text-center">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="text-xl font-black text-[#1A1A2E] mb-2">
            You&apos;re doing great!
          </h3>
          <p className="text-[#6B6B8C] font-bold">
            Complete tasks to earn more Dada Bucks!
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="dada-card bg-white p-4 text-center">
          <Star className="w-6 h-6 text-[#FFD200] mx-auto mb-2" />
          <p className="text-2xl font-black text-[#15803d]">{child.totalEarned}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Total Earned</p>
        </div>
        <div className="dada-card bg-white p-4 text-center">
          <p className="text-2xl mb-1">🎁</p>
          <p className="text-2xl font-black text-[#dc2626]">{child.totalSpent}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Total Spent</p>
        </div>
        <div className="dada-card bg-white p-4 text-center">
          <PiggyBank className="w-6 h-6 text-[#0369a1] mx-auto mb-2" />
          <p className="text-2xl font-black text-[#0369a1]">{child.savings}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Savings</p>
        </div>
      </div>
    </div>
  );
}
