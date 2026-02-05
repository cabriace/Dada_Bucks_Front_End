/**
 * ProfileSection Component (Child View)
 * 
 * Shows:
 * - Child avatar and name
 * - Transaction history
 * - Achievement badges
 * - Simple math challenge for locked actions
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import type { Transaction } from '@/types';
import { 
  History, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Sparkles,
  PiggyBank
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSection() {
  const { children, currentChildId, transactions, strikes } = useDadaStore();
  const [showLock, setShowLock] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const child = children.find(c => c.id === currentChildId) || children[0];

  if (!child) {
    return (
      <div className="text-center text-white">
        <p>No child profile found.</p>
      </div>
    );
  }

  const handleUnlock = () => {
    const numAnswer = parseInt(answer, 10);
    // Simple math: 8 + 4 = 12
    if (numAnswer === 12) {
      setUnlocked(true);
      setShowLock(false);
      setAnswer('');
      setError(false);
      toast.success('Unlocked!', { icon: '🔓' });
    } else {
      setError(true);
      setAnswer('');
    }
  };

  // Get recent transactions (last 10)
  const childTransactions = transactions.filter(t => t.childId === child.id);
  const recentTransactions = childTransactions.slice(0, 10);

  // Calculate achievements
  const achievements = [
    { id: 'earner', name: 'First Buck', emoji: '💰', unlocked: child.totalEarned >= 1 },
    { id: 'saver', name: 'Super Saver', emoji: '🐷', unlocked: child.savings >= 50 },
    { id: 'big_earner', name: 'Big Earner', emoji: '💎', unlocked: child.totalEarned >= 100 },
    { id: 'shopper', name: 'Shopper', emoji: '🛒', unlocked: child.totalSpent >= 50 },
    { id: 'streak', name: 'Good Streak', emoji: '🔥', unlocked: strikes.filter(s => s.day === new Date().toISOString().split('T')[0] && s.childId === child.id).length === 0 },
    { id: 'interest', name: 'Investor', emoji: '📈', unlocked: child.savings >= 100 },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="dada-card bg-white p-6 text-center">
        <div className="text-8xl mb-4">{child.avatar}</div>
        <h2 className="text-3xl font-black text-[#1A1A2E]">{child.name}</h2>
        <p className="text-[#6B6B8C] font-bold">Dada Bucks Champion</p>
      </div>

      {/* Achievements */}
      <div className="dada-card bg-[#FFD200] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title mb-0 flex items-center gap-2">
            <Award className="w-6 h-6" />
            Achievements
          </h3>
          <span className="text-sm font-bold text-[#1A1A2E]">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-xl p-3 text-center border-[2px] border-[#1A1A2E] transition-all ${
                achievement.unlocked
                  ? 'bg-white'
                  : 'bg-[#1A1A2E]/20 opacity-50'
              }`}
            >
              <div className="text-3xl mb-1">{achievement.emoji}</div>
              <p className={`text-xs font-bold ${achievement.unlocked ? 'text-[#1A1A2E]' : 'text-[#1A1A2E]/50'}`}>
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="dada-card bg-white p-4 text-center">
          <TrendingUp className="w-8 h-8 text-[#15803d] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#15803d]">{child.totalEarned}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Total Earned</p>
        </div>
        <div className="dada-card bg-white p-4 text-center">
          <TrendingDown className="w-8 h-8 text-[#dc2626] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#dc2626]">{child.totalSpent}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Total Spent</p>
        </div>
      </div>

      {/* Savings & Balance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="dada-card bg-[#A6EFFF] p-4 text-center">
          <PiggyBank className="w-8 h-8 text-[#0369a1] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#0369a1]">{child.savings}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Savings</p>
        </div>
        <div className="dada-card dada-card-mint p-4 text-center">
          <Sparkles className="w-8 h-8 text-[#15803d] mx-auto mb-2" />
          <p className="text-3xl font-black text-[#15803d]">{child.balance}</p>
          <p className="text-xs text-[#6B6B8C] font-bold uppercase">Balance</p>
        </div>
      </div>

      {/* Transaction History (Locked) */}
      <div className="dada-card bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title flex items-center gap-2">
            <History className="w-6 h-6" />
            History
          </h3>
          {!unlocked && (
            <button
              onClick={() => setShowLock(true)}
              className="flex items-center gap-2 px-3 py-1 bg-[#FFD200] rounded-lg border-[2px] border-[#1A1A2E] text-sm font-bold"
            >
              <Lock className="w-4 h-4" />
              Unlock
            </button>
          )}
        </div>

        {unlocked ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-[#6B6B8C] font-bold py-4">
                No transactions yet
              </p>
            ) : (
              recentTransactions.map((txn) => (
                <ChildTransactionRow key={txn.id} transaction={txn} />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#FFF6D6] rounded-xl border-[2px] border-dashed border-[#1A1A2E]">
            <Lock className="w-12 h-12 text-[#6B6B8C] mx-auto mb-2" />
            <p className="text-[#6B6B8C] font-bold">
              Solve a puzzle to see your history!
            </p>
          </div>
        )}
      </div>

      {/* Lock Modal */}
      {showLock && (
        <div className="fixed inset-0 bg-[#1A1A2E]/90 flex items-center justify-center z-50 p-4">
          <div className="math-challenge">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#FFD200] rounded-full flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
                <Lock className="w-8 h-8 text-[#1A1A2E]" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase">
              Math Challenge
            </h3>
            <p className="text-[#6B6B8C] font-bold mb-6">
              Solve this to unlock your history!
            </p>
            
            <div className="text-4xl font-black text-[#1A1A2E] mb-6">
              8 + 4 = ?
            </div>
            
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="?"
              className={`dada-input text-center text-2xl font-black mb-4 ${
                error ? 'border-[#dc2626] bg-[#FFB8D0]/20' : ''
              }`}
              autoFocus
            />
            
            {error && (
              <p className="text-[#dc2626] font-bold mb-4">
                Try again! 🤔
              </p>
            )}
            
            <div className="flex gap-2">
              <button onClick={handleUnlock} className="flex-1 dada-button dada-button-primary">
                Unlock
              </button>
              <button 
                onClick={() => setShowLock(false)} 
                className="flex-1 dada-button dada-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Child Transaction Row Component
interface ChildTransactionRowProps {
  transaction: Transaction;
}

function ChildTransactionRow({ transaction }: ChildTransactionRowProps) {
  const isEarn = transaction.type === 'earn';
  const isSpend = transaction.type === 'spend';
  const isPenalty = transaction.type === 'strike_penalty';
  const isInterest = transaction.type === 'interest';
  const isSavings = transaction.type === 'savings_deposit' || transaction.type === 'savings_withdrawal';
  
  const getEmoji = () => {
    if (isEarn) return '🎉';
    if (isSpend) return '🛒';
    if (isPenalty) return '💔';
    if (isInterest) return '✨';
    if (isSavings) return '🐷';
    return '🔄';
  };

  const getColor = () => {
    if (isEarn) return 'text-[#15803d]';
    if (isSpend) return 'text-[#dc2626]';
    if (isPenalty) return 'text-[#FF6A3D]';
    if (isInterest) return 'text-[#FFD200]';
    if (isSavings) return 'text-[#0369a1]';
    return 'text-[#6B6B8C]';
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[#FFF6D6] rounded-xl border-[2px] border-[#1A1A2E]">
      <div className="text-2xl">{getEmoji()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1A1A2E] text-sm truncate">{transaction.description}</p>
        <p className="text-xs text-[#6B6B8C] font-bold">
          {new Date(transaction.timestamp).toLocaleDateString()}
        </p>
      </div>
      <div className={`font-black text-lg ${getColor()}`}>
        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
      </div>
    </div>
  );
}
