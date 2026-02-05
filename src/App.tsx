/**
 * Dada Bucks - Main App Component
 * 
 * A children's behavior and habit-building app using 100% virtual currency.
 * NO REAL MONEY - NO BANKING - NO DEBIT CARDS
 * 
 * Features:
 * - Parent View: Full control over tasks, payouts, strikes, and approvals
 * - Child View: Simple interface to earn and spend Dada Bucks
 * - Multi-child support
 * - Savings with daily interest
 * - 10 PM daily reset with pending earnings
 * - Strike system
 * - Transaction History
 */

import { useEffect, useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { ParentView } from '@/views/ParentView';
import { ChildView } from '@/views/ChildView';
import { ViewToggle } from '@/components/ViewToggle';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import './App.css';

function App() {
  const { 
    currentView, 
    checkAndPerformDailyReset, 
    children, 
    currentChildId,
    switchChild 
  } = useDadaStore();
  
  const [initialized, setInitialized] = useState(false);

  // Initialize current child if not set
  useEffect(() => {
    if (children.length > 0 && !currentChildId) {
      switchChild(children[0].id);
    }
    setInitialized(true);
  }, [children, currentChildId, switchChild]);

  // Check for daily reset on mount
  useEffect(() => {
    if (!initialized) return;
    
    const result = checkAndPerformDailyReset();
    if (result.didReset) {
      if (result.earningsDeposited && result.earningsDeposited > 0) {
        toast.success(
          `🎉 Daily deposit! ${result.earningsDeposited} Dada Bucks added to your balance!`,
          { duration: 5000 }
        );
      }
      if (result.interestEarned && result.interestEarned > 0) {
        toast.success(
          `💰 Savings interest! +${result.interestEarned} Dada Bucks earned!`,
          { duration: 5000 }
        );
      }
      toast.info('🌙 New day started! Tasks and strikes have been reset.', {
        duration: 4000,
      });
    }
  }, [initialized, checkAndPerformDailyReset]);

  // Set up interval to check for reset every minute
  useEffect(() => {
    if (!initialized) return;
    
    const interval = setInterval(() => {
      const result = checkAndPerformDailyReset();
      if (result.didReset) {
        if (result.earningsDeposited && result.earningsDeposited > 0) {
          toast.success(
            `🎉 Daily deposit! ${result.earningsDeposited} Dada Bucks added!`,
            { duration: 5000 }
          );
        }
        if (result.interestEarned && result.interestEarned > 0) {
          toast.success(
            `💰 Savings interest! +${result.interestEarned} Dada Bucks!`,
            { duration: 5000 }
          );
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [initialized, checkAndPerformDailyReset]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#7B5CFF] flex items-center justify-center">
        <div className="text-white text-2xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#7B5CFF] font-nunito overflow-x-hidden">
      {/* Grain Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-[#FFD200] border-[3px] border-[#1A1A2E] rounded-2xl px-4 py-2 shadow-[0_6px_0_#1A1A2E]">
          <span className="text-[#1A1A2E] font-black text-xl tracking-tight">
            Dada Bucks
          </span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-40">
        <ViewToggle />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-20 pb-8 px-4 min-h-screen">
        {currentView === 'parent' ? <ParentView /> : <ChildView />}
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFF6D6',
            border: '3px solid #1A1A2E',
            borderRadius: '16px',
            boxShadow: '0 8px 0 #1A1A2E',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
          },
        }}
      />
    </div>
  );
}

export default App;
