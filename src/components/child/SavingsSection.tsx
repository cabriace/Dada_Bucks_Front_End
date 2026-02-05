/**
 * SavingsSection Component (Child View)
 * 
 * Shows:
 * - Savings balance
 * - Daily interest earned
 * - Deposit/Withdraw controls
 * - Interest rate explanation
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { PiggyBank, ArrowRight, ArrowLeft, Sparkles, TrendingUp, Info } from 'lucide-react';
import { toast } from 'sonner';

export function SavingsSection() {
  const { 
    children, 
    currentChildId, 
    depositToSavings, 
    withdrawFromSavings,
    getNextResetTime 
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];
  const [depositAmount, setDepositAmount] = useState(10);
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  if (!child) return null;

  // Calculate daily interest
  const dailyInterest = Math.floor(child.savings / 100);
  const nextReset = getNextResetTime();
  const resetTimeString = nextReset.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const handleDeposit = () => {
    const result = depositToSavings(depositAmount);
    if (result.success) {
      toast.success(result.message, { icon: '🐷' });
      setShowDeposit(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleWithdraw = () => {
    const result = withdrawFromSavings(withdrawAmount);
    if (result.success) {
      toast.success(result.message, { icon: '💰' });
      setShowWithdraw(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-title text-white">My Savings</h2>
        <p className="text-white/80 font-bold">
          Save Dada Bucks and earn interest!
        </p>
      </div>

      {/* Main Savings Card */}
      <div className="dada-card bg-[#A6EFFF] p-8 text-center relative overflow-hidden">
        {/* Decorative piggy banks */}
        <div className="absolute top-4 left-4 text-4xl animate-float">🐷</div>
        <div className="absolute top-8 right-8 text-3xl animate-float" style={{ animationDelay: '1s' }}>💰</div>
        <div className="absolute bottom-4 left-8 text-2xl animate-float" style={{ animationDelay: '2s' }}>✨</div>
        
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-[4px] border-[#1A1A2E] shadow-[0_6px_0_#1A1A2E]">
          <PiggyBank className="w-10 h-10 text-[#1A1A2E]" />
        </div>
        
        <p className="dada-label mb-2">Savings Balance</p>
        
        <div className="balance-display text-[#1A1A2E] mb-2">
          {child.savings}
        </div>
        <p className="text-[#1A1A2E]/70 font-bold">Dada Bucks</p>

        {/* Daily Interest Info */}
        {dailyInterest > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 border-[3px] border-[#1A1A2E]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#FFD200]" />
              <span className="font-bold text-[#1A1A2E]">Daily Interest</span>
            </div>
            <p className="text-3xl font-black text-[#15803d]">+{dailyInterest} DB</p>
            <p className="text-sm text-[#6B6B8C] font-bold mt-1">
              Earned every day at {resetTimeString}!
            </p>
          </div>
        )}
      </div>

      {/* Interest Explanation */}
      <div className="dada-card bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#FFD200] rounded-lg flex items-center justify-center border-[2px] border-[#1A1A2E] flex-shrink-0">
            <Info className="w-5 h-5 text-[#1A1A2E]" />
          </div>
          <div>
            <h3 className="font-black text-[#1A1A2E] mb-1">How Interest Works</h3>
            <p className="text-[#6B6B8C] font-bold text-sm">
              For every 100 Dada Bucks you save, you earn 1 extra Dada Buck every day!
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-[#1A1A2E] font-bold">💡 Examples:</p>
              <p className="text-[#6B6B8C] font-bold">• 100 saved → +1 DB/day</p>
              <p className="text-[#6B6B8C] font-bold">• 250 saved → +2 DB/day</p>
              <p className="text-[#6B6B8C] font-bold">• 500 saved → +5 DB/day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Balance */}
      <div className="dada-card dada-card-mint p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <span className="font-bold text-[#1A1A2E]">Available to Save:</span>
        </div>
        <span className="text-3xl font-black text-[#1A1A2E]">{child.balance} DB</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deposit Button */}
        <button
          onClick={() => {
            setShowDeposit(true);
            setShowWithdraw(false);
          }}
          className="dada-button dada-button-success py-6"
          disabled={child.balance <= 0}
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Deposit
        </button>

        {/* Withdraw Button */}
        <button
          onClick={() => {
            setShowWithdraw(true);
            setShowDeposit(false);
          }}
          className="dada-button dada-button-primary py-6"
          disabled={child.savings <= 0}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Withdraw
        </button>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="dada-card bg-[#B8FFC9] p-6">
          <h3 className="card-title mb-4 text-center">Deposit to Savings</h3>
          <p className="text-center text-[#6B6B8C] font-bold mb-4">
            Balance: {child.balance} DB
          </p>
          <input
            type="number"
            min={1}
            max={child.balance}
            value={depositAmount}
            onChange={(e) => setDepositAmount(Math.min(parseInt(e.target.value) || 0, child.balance))}
            className="dada-input text-center text-2xl font-black mb-4"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleDeposit} 
              className="flex-1 dada-button dada-button-success"
              disabled={depositAmount <= 0 || depositAmount > child.balance}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Deposit
            </button>
            <button 
              onClick={() => setShowDeposit(false)} 
              className="flex-1 dada-button dada-button-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Form */}
      {showWithdraw && (
        <div className="dada-card bg-[#FFD200] p-6">
          <h3 className="card-title mb-4 text-center">Withdraw from Savings</h3>
          <p className="text-center text-[#6B6B8C] font-bold mb-4">
            Savings: {child.savings} DB
          </p>
          <input
            type="number"
            min={1}
            max={child.savings}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Math.min(parseInt(e.target.value) || 0, child.savings))}
            className="dada-input text-center text-2xl font-black mb-4"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleWithdraw} 
              className="flex-1 dada-button dada-button-primary"
              disabled={withdrawAmount <= 0 || withdrawAmount > child.savings}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Withdraw
            </button>
            <button 
              onClick={() => setShowWithdraw(false)} 
              className="flex-1 dada-button dada-button-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Savings Goal */}
      <div className="dada-card bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#FFD200] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
            <TrendingUp className="w-6 h-6 text-[#1A1A2E]" />
          </div>
          <div>
            <h3 className="font-black text-[#1A1A2E] uppercase">Savings Goal</h3>
            <p className="text-sm text-[#6B6B8C] font-bold">Save 100 to start earning!</p>
          </div>
        </div>
        
        <div className="bg-[#FFF6D6] rounded-xl p-4 border-[3px] border-[#1A1A2E]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#1A1A2E]">Progress</span>
            <span className="font-black text-[#1A1A2E]">{child.savings} / 100</span>
          </div>
          <div className="dada-progress">
            <div 
              className="dada-progress-fill bg-[#A6EFFF]"
              style={{ width: `${Math.min((child.savings / 100) * 100, 100)}%` }}
            />
          </div>
          {child.savings >= 100 ? (
            <p className="text-center text-[#15803d] font-bold mt-2">
              🎉 You&apos;re earning interest! Keep saving!
            </p>
          ) : (
            <p className="text-center text-[#6B6B8C] font-bold mt-2">
              {100 - child.savings} more to start earning!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
