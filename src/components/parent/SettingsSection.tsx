/**
 * SettingsSection Component
 * 
 * Parent settings for:
 * - Managing child profile
 * - Viewing transaction history
 * - Resetting strikes
 * - Adding Dada Bucks to vault
 * - Resetting all data
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import type { Transaction } from '@/types';
import { 
  History, 
  RotateCcw, 
  Plus, 
  AlertTriangle, 
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  PiggyBank,
  Sparkles,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsSection() {
  const { 
    children,
    currentChildId,
    vault, 
    transactions, 
    strikes, 
    resetStrikes, 
    addToVault,
    resetAll,
    getNextResetTime 
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];

  const [showAddBucks, setShowAddBucks] = useState(false);
  const [bucksToAdd, setBucksToAdd] = useState(50);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleAddBucks = () => {
    if (bucksToAdd > 0) {
      addToVault(bucksToAdd);
      toast.success(`Added ${bucksToAdd} Dada Bucks to vault!`, { icon: '💰' });
      setShowAddBucks(false);
      setBucksToAdd(50);
    }
  };

  const handleResetStrikes = () => {
    resetStrikes();
    toast.success('All strikes reset!', { icon: '✨' });
  };

  const handleResetAll = () => {
    resetAll();
    setShowResetConfirm(false);
    toast.success('App reset to defaults!', { icon: '🔄' });
  };

  // Get recent transactions for current child
  const childTransactions = transactions.filter(t => t.childId === child?.id);
  const recentTransactions = showAllHistory 
    ? childTransactions 
    : childTransactions.slice(0, 10);

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
      {/* Header */}
      <div>
        <h2 className="section-title text-white">Settings</h2>
        <p className="text-white/80 font-bold">
          Manage profile, view history, and configure the app
        </p>
      </div>

      {/* Next Reset Info */}
      <div className="dada-card bg-[#A6EFFF] p-4">
        <div className="flex items-center gap-3">
          <Moon className="w-6 h-6 text-[#1A1A2E]" />
          <div>
            <p className="font-bold text-[#1A1A2E]">Next Daily Reset</p>
            <p className="text-sm text-[#1A1A2E]/70 font-bold">
              {resetTimeString} - Tasks, strikes, and pending earnings will reset
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Bucks */}
        <div className="dada-card bg-[#FFF6D6] p-6">
          <h3 className="card-title mb-4">Add to Vault</h3>
          <p className="text-[#6B6B8C] font-bold mb-4">
            Current: {vault.balance} / {vault.maxBalance} DB
          </p>
          {!showAddBucks ? (
            <button
              onClick={() => setShowAddBucks(true)}
              className="dada-button dada-button-primary w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Dada Bucks
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="number"
                min={1}
                max={500}
                value={bucksToAdd}
                onChange={(e) => setBucksToAdd(parseInt(e.target.value) || 0)}
                className="dada-input text-center text-xl font-black"
              />
              <div className="flex gap-2">
                <button onClick={handleAddBucks} className="flex-1 dada-button dada-button-success">
                  Add
                </button>
                <button 
                  onClick={() => setShowAddBucks(false)} 
                  className="flex-1 dada-button dada-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Strikes */}
        <div className="dada-card bg-[#FFB8D0] p-6">
          <h3 className="card-title mb-4">Strike Management</h3>
          <p className="text-[#1A1A2E] font-bold mb-4">
            Active strikes for {child.name}: {strikes.filter(s => s.childId === child.id).length}
          </p>
          <button
            onClick={handleResetStrikes}
            className="dada-button dada-button-danger w-full"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset All Strikes
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="dada-card bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title flex items-center gap-2">
            <History className="w-6 h-6" />
            Transaction History
          </h3>
          <span className="text-[#6B6B8C] font-bold">
            {childTransactions.length} total
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-center text-[#6B6B8C] font-bold py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentTransactions.map((txn) => (
              <TransactionRow key={txn.id} transaction={txn} />
            ))}
          </div>
        )}

        {childTransactions.length > 10 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full mt-4 py-3 text-[#7B5CFF] font-bold hover:underline"
          >
            {showAllHistory ? 'Show Less' : `View All ${childTransactions.length} Transactions`}
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="dada-card bg-[#FF6A3D] p-6">
        <h3 className="card-title text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Danger Zone
        </h3>
        <p className="text-white/90 font-bold mb-4">
          Reset all data to default values. This cannot be undone!
        </p>
        
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="dada-button bg-white text-[#FF6A3D] border-[#1A1A2E] w-full"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Reset All Data
          </button>
        ) : (
          <div className="bg-white rounded-xl p-4 border-[3px] border-[#1A1A2E]">
            <p className="text-[#1A1A2E] font-bold mb-4">
              Are you sure? All data will be lost!
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleResetAll} 
                className="flex-1 dada-button dada-button-danger"
              >
                Yes, Reset Everything
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)} 
                className="flex-1 dada-button dada-button-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Transaction Row Component
interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isEarn = transaction.type === 'earn';
  const isSpend = transaction.type === 'spend';
  const isPenalty = transaction.type === 'strike_penalty';
  const isInterest = transaction.type === 'interest';
  const isSavings = transaction.type === 'savings_deposit' || transaction.type === 'savings_withdrawal';
  
  const getIcon = () => {
    if (isEarn) return <TrendingUp className="w-4 h-4 text-[#15803d]" />;
    if (isSpend) return <TrendingDown className="w-4 h-4 text-[#dc2626]" />;
    if (isPenalty) return <AlertTriangle className="w-4 h-4 text-[#FF6A3D]" />;
    if (isInterest) return <Sparkles className="w-4 h-4 text-[#FFD200]" />;
    if (isSavings) return <PiggyBank className="w-4 h-4 text-[#0369a1]" />;
    return <RotateCcw className="w-4 h-4 text-[#6B6B8C]" />;
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
      <div className="w-8 h-8 rounded-lg bg-[#1A1A2E] flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1A1A2E] truncate text-sm">{transaction.description}</p>
        <p className="text-xs text-[#6B6B8C] font-bold">
          {new Date(transaction.timestamp).toLocaleString()}
        </p>
      </div>
      <div className={`font-black text-lg ${getColor()}`}>
        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
      </div>
    </div>
  );
}
