/**
 * RequestsSection Component
 * 
 * Parent interface for managing spend requests:
 * - View pending requests
 * - Approve requests (deducts from child, returns to vault)
 * - Deny requests (no balance change)
 * - View request history
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import type { SpendRequest } from '@/types';
import { Check, X, History, Clock, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function RequestsSection() {
  const { 
    pendingRequests, 
    requestHistory, 
    approveRequest, 
    denyRequest,
    children,
    currentChildId 
  } = useDadaStore();

  const [showHistory, setShowHistory] = useState(false);
  
  const currentChild = children.find(c => c.id === currentChildId) || children[0];

  // Filter requests for current child
  const childPendingRequests = pendingRequests.filter(r => r.childId === currentChild?.id);
  const childRequestHistory = requestHistory.filter(r => r.childId === currentChild?.id);

  const handleApprove = (requestId: string) => {
    const result = approveRequest(requestId);
    if (result.success) {
      toast.success('Request approved!', { icon: '✅' });
    } else {
      toast.error(result.message);
    }
  };

  const handleDeny = (requestId: string) => {
    denyRequest(requestId);
    toast.info('Request denied', { icon: '❌' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title text-white">Spending Requests</h2>
          <p className="text-white/80 font-bold">
            Approve or deny {currentChild?.name}'s spending requests
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="dada-button dada-button-secondary"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {/* Pending Requests */}
      {!showHistory && (
        <div className="space-y-4">
          {childPendingRequests.length === 0 ? (
            <div className="dada-card bg-white p-12 text-center">
              <div className="w-20 h-20 bg-[#B8FFC9] rounded-full flex items-center justify-center mx-auto mb-4 border-[3px] border-[#1A1A2E] shadow-[0_6px_0_#1A1A2E]">
                <ShoppingCart className="w-10 h-10 text-[#1A1A2E]" />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A2E] mb-2">
                No Pending Requests
              </h3>
              <p className="text-[#6B6B8C] font-bold">
                When {currentChild?.name} requests to spend, it will appear here
              </p>
            </div>
          ) : (
            childPendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onDeny={() => handleDeny(request.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Request History */}
      {showHistory && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase">Past Requests</h3>
          {childRequestHistory.length === 0 ? (
            <div className="dada-card bg-white p-8 text-center">
              <p className="text-[#6B6B8C] font-bold">No request history yet</p>
            </div>
          ) : (
            childRequestHistory.map((request) => (
              <HistoryCard key={request.id} request={request} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Request Card Component
interface RequestCardProps {
  request: SpendRequest;
  onApprove: () => void;
  onDeny: () => void;
}

function RequestCard({ request, onApprove, onDeny }: RequestCardProps) {
  const timeAgo = getTimeAgo(request.requestedAt);

  return (
    <div className="dada-card bg-[#FFF6D6] p-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFD200] rounded-xl flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
            <ShoppingCart className="w-6 h-6 text-[#1A1A2E]" />
          </div>
          <div>
            <h4 className="font-black text-lg text-[#1A1A2E]">Spend Request</h4>
            <div className="flex items-center gap-2 text-[#6B6B8C] font-bold text-sm">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-[#1A1A2E]">{request.totalCost}</p>
          <p className="text-sm text-[#6B6B8C] font-bold">Dada Bucks</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border-[2px] border-[#1A1A2E] p-4 mb-6">
        <h5 className="font-bold text-[#6B6B8C] uppercase text-xs mb-3">Items</h5>
        <div className="space-y-2">
          {request.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-bold text-[#1A1A2E]">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="text-sm text-[#6B6B8C] font-bold">x{item.quantity}</span>
                )}
              </div>
              <span className="font-black text-[#1A1A2E]">{item.cost * item.quantity} DB</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 dada-button dada-button-success"
        >
          <Check className="w-5 h-5 mr-2" />
          Approve
        </button>
        <button
          onClick={onDeny}
          className="flex-1 dada-button dada-button-danger"
        >
          <X className="w-5 h-5 mr-2" />
          Deny
        </button>
      </div>
    </div>
  );
}

// History Card Component
interface HistoryCardProps {
  request: SpendRequest;
}

function HistoryCard({ request }: HistoryCardProps) {
  const isApproved = request.status === 'approved';
  const timeAgo = request.respondedAt 
    ? getTimeAgo(request.respondedAt)
    : getTimeAgo(request.requestedAt);

  return (
    <div className={`dada-card p-4 ${isApproved ? 'bg-[#B8FFC9]' : 'bg-[#FFB8D0]'}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-[2px] border-[#1A1A2E] ${
            isApproved ? 'bg-[#1A1A2E]' : 'bg-[#1A1A2E]'
          }`}>
            {isApproved ? (
              <Check className="w-5 h-5 text-[#B8FFC9]" />
            ) : (
              <X className="w-5 h-5 text-[#FFB8D0]" />
            )}
          </div>
          <div>
            <p className="font-bold text-[#1A1A2E]">
              {request.items.map(i => i.name).join(', ')}
            </p>
            <p className="text-sm text-[#6B6B8C] font-bold">{timeAgo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-[#1A1A2E]">{request.totalCost} DB</p>
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
            isApproved 
              ? 'bg-[#1A1A2E] text-[#B8FFC9]' 
              : 'bg-[#1A1A2E] text-[#FFB8D0]'
          }`}>
            {isApproved ? 'Approved' : 'Denied'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
