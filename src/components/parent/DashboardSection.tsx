/**
 * DashboardSection Component
 * 
 * Parent dashboard showing:
 * - Vault balance
 * - Child balance and savings
 * - Pending earnings (waiting for 10 PM)
 * - Today's stats
 * - Strike counter
 * - Next reset time
 */

import { useDadaStore } from '@/store/dadaStore';
import { Vault, Wallet, PiggyBank, TrendingUp, AlertTriangle, Clock, Moon } from 'lucide-react';
import { MAX_STRIKES, RESET_HOUR } from '@/types';

export function DashboardSection() {
  const { 
    vault, 
    children,
    currentChildId,
    strikes, 
    pendingRequests,
    getTodayStats,
    getNextResetTime 
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];
  const todayStats = getTodayStats();
  const todayStrikes = strikes.filter(s => 
    s.day === new Date().toISOString().split('T')[0] && s.childId === child?.id
  ).length;
  const pendingCount = pendingRequests.filter(r => r.status === 'pending' && r.childId === child?.id).length;
  
  // Format next reset time
  const nextReset = getNextResetTime();
  const resetTimeString = nextReset.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  if (!child) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="section-title text-white mb-2">
          {child.name}'s Dashboard
        </h1>
        <p className="text-white/80 font-bold">
          Manage tasks, track earnings, and approve spending
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vault Balance */}
        <div className="dada-card dada-card-cream p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#A6EFFF] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
                <Vault className="w-6 h-6 text-[#1A1A2E]" />
              </div>
              <div>
                <p className="dada-label">Vault Balance</p>
                <p className="text-sm text-[#6B6B8C] font-bold">Max: {vault.maxBalance} DB</p>
              </div>
            </div>
          </div>
          <div className="balance-display text-[#1A1A2E]">
            {vault.balance}
          </div>
          <p className="text-[#6B6B8C] font-bold mt-2">Dada Bucks</p>
          
          {/* Vault Progress */}
          <div className="mt-4">
            <div className="dada-progress">
              <div 
                className="dada-progress-fill"
                style={{ width: `${(vault.balance / vault.maxBalance) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Child Balance */}
        <div className="dada-card dada-card-mint p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFD200] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
                <Wallet className="w-6 h-6 text-[#1A1A2E]" />
              </div>
              <div>
                <p className="dada-label">{child.name}'s Balance</p>
                <p className="text-sm text-[#6B6B8C] font-bold">Available to spend</p>
              </div>
            </div>
            <div className="text-4xl">{child.avatar}</div>
          </div>
          <div className="balance-display text-[#1A1A2E]">
            {child.balance}
          </div>
          <p className="text-[#6B6B8C] font-bold mt-2">Dada Bucks</p>
        </div>
      </div>

      {/* Savings & Pending Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Savings */}
        <div className="dada-card bg-[#A6EFFF] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
              <PiggyBank className="w-6 h-6 text-[#1A1A2E]" />
            </div>
            <div>
              <p className="dada-label">Savings</p>
              <p className="text-sm text-[#1A1A2E]/70 font-bold">Earns 1 DB per 100 saved daily</p>
            </div>
          </div>
          <div className="text-4xl font-black text-[#1A1A2E]">
            {child.savings}
          </div>
          <p className="text-[#1A1A2E]/70 font-bold mt-1">Dada Bucks</p>
          {child.savings >= 100 && (
            <p className="text-sm text-[#1A1A2E] font-bold mt-2">
              💰 Earns +{Math.floor(child.savings / 100)} DB per day!
            </p>
          )}
        </div>

        {/* Pending Earnings */}
        <div className="dada-card bg-[#FFF6D6] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#FFD200] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
              <Moon className="w-6 h-6 text-[#1A1A2E]" />
            </div>
            <div>
              <p className="dada-label">Pending Earnings</p>
              <p className="text-sm text-[#6B6B8C] font-bold">Deposited at {RESET_HOUR}:00 PM</p>
            </div>
          </div>
          <div className="text-4xl font-black text-[#1A1A2E]">
            {child.pendingEarnings}
          </div>
          <p className="text-[#6B6B8C] font-bold mt-1">Dada Bucks</p>
          <p className="text-sm text-[#6B6B8C] font-bold mt-2">
            Next deposit: {resetTimeString}
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Earnings */}
        <div className="dada-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            <p className="dada-label text-xs">Earned Today</p>
          </div>
          <p className="text-3xl font-black text-[#22c55e]">
            +{todayStats.earned}
          </p>
        </div>

        {/* Today's Spending */}
        <div className="dada-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-5 h-5 text-[#ef4444]" />
            <p className="dada-label text-xs">Spent Today</p>
          </div>
          <p className="text-3xl font-black text-[#ef4444]">
            -{todayStats.spent}
          </p>
        </div>

        {/* Strikes */}
        <div className="dada-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-[#FF6A3D]" />
            <p className="dada-label text-xs">Strikes Today</p>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-black ${todayStrikes >= MAX_STRIKES ? 'text-[#FF6A3D]' : 'text-[#1A1A2E]'}`}>
              {todayStrikes}
            </p>
            <span className="text-[#6B6B8C] font-bold">/ {MAX_STRIKES}</span>
          </div>
          {todayStrikes >= MAX_STRIKES && (
            <p className="text-xs text-[#FF6A3D] font-bold mt-1">
              Earnings forfeited!
            </p>
          )}
        </div>

        {/* Pending Requests */}
        <div className="dada-card bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#7B5CFF]" />
            <p className="dada-label text-xs">Pending</p>
          </div>
          <p className="text-3xl font-black text-[#1A1A2E]">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Strike Warning */}
      {todayStrikes > 0 && todayStrikes < MAX_STRIKES && (
        <div className="dada-card bg-[#FFD200] p-4 border-[#1A1A2E]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#1A1A2E]" />
            <div>
              <p className="font-black text-[#1A1A2E] uppercase">
                Warning: {todayStrikes} Strike{todayStrikes !== 1 ? 's' : ''}
              </p>
              <p className="text-[#1A1A2E] font-bold text-sm">
                {MAX_STRIKES - todayStrikes} more and all pending earnings will be forfeited!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Stats */}
      <div className="dada-card bg-white p-6">
        <h3 className="card-title mb-4">Lifetime Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-4xl font-black text-[#15803d]">{child.totalEarned}</p>
            <p className="dada-label mt-1">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-[#dc2626]">{child.totalSpent}</p>
            <p className="dada-label mt-1">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-[#0369a1]">{child.savings}</p>
            <p className="dada-label mt-1">Savings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
