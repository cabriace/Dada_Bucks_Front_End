/**
 * ParentView Component
 * 
 * The main parent interface with 4 sections:
 * 1. Dashboard - Overview of balances, earnings, and strikes
 * 2. Earn - Task management and tracking
 * 3. Requests - Spending approval queue
 * 4. Settings - Profile, children management, and app settings
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { DashboardSection } from '@/components/parent/DashboardSection';
import { TaskSection } from '@/components/parent/TaskSection';
import { RequestsSection } from '@/components/parent/RequestsSection';
import { SettingsSection } from '@/components/parent/SettingsSection';
import { ChildSelector } from '@/components/parent/ChildSelector';

type ParentTab = 'dashboard' | 'earn' | 'requests' | 'settings';

export function ParentView() {
  const [activeTab, setActiveTab] = useState<ParentTab>('dashboard');
  const { pendingRequests, children, currentChildId } = useDadaStore();

  const currentChild = children.find(c => c.id === currentChildId) || children[0];
  const pendingCount = pendingRequests.filter(r => r.status === 'pending' && r.childId === currentChild?.id).length;

  const tabs: { id: ParentTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Home' },
    { id: 'earn', label: 'Earn' },
    { id: 'requests', label: 'Requests', badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Child Selector */}
      <div className="mb-6">
        <ChildSelector />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dada-tab relative ${activeTab === tab.id ? 'dada-tab-active' : ''}`}
          >
            {tab.label}
            {tab.badge && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6A3D] text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-[#1A1A2E]">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-in">
        {activeTab === 'dashboard' && <DashboardSection />}
        {activeTab === 'earn' && <TaskSection />}
        {activeTab === 'requests' && <RequestsSection />}
        {activeTab === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
}
