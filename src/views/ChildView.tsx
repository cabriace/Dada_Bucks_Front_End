/**
 * ChildView Component
 * 
 * The main child interface with 4 sections:
 * 1. Balance - Large animated balance display
 * 2. Savings - Manage savings and see interest
 * 3. Spend - Shop for rewards
 * 4. Profile - Avatar and transaction history
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { BalanceSection } from '@/components/child/BalanceSection';
import { SavingsSection } from '@/components/child/SavingsSection';
import { SpendSection } from '@/components/child/SpendSection';
import { ProfileSection } from '@/components/child/ProfileSection';
import { ApprovalNotification } from '@/components/child/ApprovalNotification';

type ChildTab = 'balance' | 'savings' | 'spend' | 'profile';

export function ChildView() {
  const [activeTab, setActiveTab] = useState<ChildTab>('balance');
  const { 
    pendingRequests, 
    children, 
    currentChildId
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];

  const hasPendingRequest = pendingRequests.some(
    r => r.childId === child?.id && r.status === 'pending'
  );

  const tabs: { id: ChildTab; label: string; emoji: string; badge?: boolean }[] = [
    { id: 'balance', label: 'My Bucks', emoji: '💰' },
    { id: 'savings', label: 'Savings', emoji: '🐷' },
    { id: 'spend', label: 'Shop', emoji: '🛒', badge: hasPendingRequest },
    { id: 'profile', label: 'Me', emoji: child?.avatar || '👧' },
  ];

  if (!child) {
    return (
      <div className="text-center text-white">
        <p className="text-xl font-bold">No child profile found.</p>
        <p>Please create a child in Parent mode.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Approval Notifications */}
      <ApprovalNotification />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dada-tab relative text-lg ${activeTab === tab.id ? 'dada-tab-active' : ''}`}
          >
            <span className="mr-2">{tab.emoji}</span>
            {tab.label}
            {tab.badge && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD200] text-[#1A1A2E] text-xs font-black rounded-full flex items-center justify-center border-2 border-[#1A1A2E] animate-bounce">
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-in">
        {activeTab === 'balance' && <BalanceSection />}
        {activeTab === 'savings' && <SavingsSection />}
        {activeTab === 'spend' && <SpendSection />}
        {activeTab === 'profile' && <ProfileSection />}
      </div>
    </div>
  );
}
