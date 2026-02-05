/**
 * ApprovalNotification Component
 * 
 * Shows approved spend requests to the child with clear visual confirmation.
 * Displays item name, approval status, and date/time.
 */

import { useState, useEffect } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { Check, PartyPopper, ShoppingBag } from 'lucide-react';

export function ApprovalNotification() {
  const { 
    getUnshownApprovedRequests, 
    markNotificationShown,
    children,
    currentChildId 
  } = useDadaStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const child = children.find(c => c.id === currentChildId) || children[0];
  const unshownRequests = getUnshownApprovedRequests();

  useEffect(() => {
    if (unshownRequests.length > 0 && !isVisible) {
      setIsVisible(true);
      setCurrentIndex(0);
    }
  }, [unshownRequests, isVisible]);

  if (!isVisible || unshownRequests.length === 0 || !child) {
    return null;
  }

  const currentRequest = unshownRequests[currentIndex];

  const handleClose = () => {
    // Mark current request as shown
    markNotificationShown(currentRequest.requestId);
    
    if (currentIndex < unshownRequests.length - 1) {
      // Show next request
      setCurrentIndex(currentIndex + 1);
    } else {
      // Close the notification
      setIsVisible(false);
      setCurrentIndex(0);
    }
  };

  const handleDismissAll = () => {
    // Mark all as shown
    unshownRequests.forEach(req => {
      markNotificationShown(req.requestId);
    });
    setIsVisible(false);
    setCurrentIndex(0);
  };

  const formattedDate = new Date(currentRequest.approvedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 bg-[#1A1A2E]/80 flex items-center justify-center z-50 p-4">
      <div className="dada-card bg-[#B8FFC9] w-full max-w-md animate-pop">
        {/* Header */}
        <div className="text-center p-6 border-b-[3px] border-[#1A1A2E]">
          <div className="w-20 h-20 bg-[#FFD200] rounded-full flex items-center justify-center mx-auto mb-4 border-[4px] border-[#1A1A2E] shadow-[0_6px_0_#1A1A2E]">
            <PartyPopper className="w-10 h-10 text-[#1A1A2E]" />
          </div>
          <h2 className="text-3xl font-black text-[#1A1A2E] uppercase mb-1">
            Approved! 🎉
          </h2>
          <p className="text-[#1A1A2E]/70 font-bold">
            Mom/Dad said YES!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Items */}
          <div className="bg-white rounded-xl border-[3px] border-[#1A1A2E] p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5 text-[#1A1A2E]" />
              <span className="font-bold text-[#1A1A2E]">Items Approved:</span>
            </div>
            <div className="space-y-2">
              {currentRequest.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-[#1A1A2E]">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-sm text-[#6B6B8C] font-bold">x{item.quantity}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t-2 border-dashed border-[#1A1A2E]/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1A2E]">Total Spent:</span>
                <span className="text-2xl font-black text-[#dc2626]">-{currentRequest.totalCost} DB</span>
              </div>
            </div>
          </div>

          {/* Approval Details */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFD200] rounded-full flex items-center justify-center border-[2px] border-[#1A1A2E]">
              <Check className="w-5 h-5 text-[#1A1A2E]" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A2E]">Status: APPROVED ✅</p>
              <p className="text-sm text-[#6B6B8C] font-bold">{formattedDate}</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-[#1A1A2E] font-bold mb-4">
            Your balance has been updated. Have fun!
          </p>

          {/* Counter */}
          {unshownRequests.length > 1 && (
            <p className="text-center text-sm text-[#6B6B8C] font-bold mb-4">
              {currentIndex + 1} of {unshownRequests.length} approvals
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t-[3px] border-[#1A1A2E] bg-white rounded-b-[25px]">
          <button
            onClick={handleClose}
            className="w-full dada-button dada-button-success mb-2"
          >
            <Check className="w-5 h-5 mr-2" />
            {currentIndex < unshownRequests.length - 1 ? 'Next' : 'Awesome!'}
          </button>
          {unshownRequests.length > 1 && (
            <button
              onClick={handleDismissAll}
              className="w-full py-2 text-[#6B6B8C] font-bold text-sm hover:underline"
            >
              Dismiss all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
