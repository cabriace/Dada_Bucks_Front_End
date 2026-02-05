/**
 * ViewToggle Component
 * 
 * Allows switching between Parent and Child views.
 * Includes a simple math challenge when switching to Parent view for security.
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import type { UserRole } from '@/types';
import { Shield, User, Lock, X } from 'lucide-react';

export function ViewToggle() {
  const { currentView, setView, isParentLocked, lockParent, unlockParent } = useDadaStore();
  const [showLock, setShowLock] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const handleViewChange = (view: UserRole) => {
    if (view === 'parent') {
      if (isParentLocked) {
        setShowLock(true);
      } else {
        setView('parent');
        lockParent(); // Lock after switching to parent
      }
    } else {
      setView('child');
    }
  };

  const handleUnlock = () => {
    const numAnswer = parseInt(answer, 10);
    if (unlockParent(numAnswer)) {
      setShowLock(false);
      setAnswer('');
      setError(false);
      setView('parent');
      lockParent(); // Re-lock after switching
    } else {
      setError(true);
      setAnswer('');
    }
  };

  const handleClose = () => {
    setShowLock(false);
    setAnswer('');
    setError(false);
  };

  return (
    <>
      {/* Toggle Buttons */}
      <div className="flex bg-white border-[3px] border-[#1A1A2E] rounded-2xl p-1 shadow-[0_6px_0_#1A1A2E]">
        <button
          onClick={() => handleViewChange('parent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all ${
            currentView === 'parent'
              ? 'bg-[#FFD200] text-[#1A1A2E]'
              : 'text-[#6B6B8C] hover:text-[#1A1A2E]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Parent
        </button>
        <button
          onClick={() => handleViewChange('child')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all ${
            currentView === 'child'
              ? 'bg-[#B8FFC9] text-[#1A1A2E]'
              : 'text-[#6B6B8C] hover:text-[#1A1A2E]'
          }`}
        >
          <User className="w-4 h-4" />
          Kid
        </button>
      </div>

      {/* Lock Overlay */}
      {showLock && (
        <div className="lock-overlay" onClick={handleClose}>
          <div className="math-challenge" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#FFD200] rounded-full flex items-center justify-center border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E]">
                <Lock className="w-8 h-8 text-[#1A1A2E]" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-[#1A1A2E] mb-2 uppercase">
              Parent Lock
            </h3>
            <p className="text-[#6B6B8C] font-bold mb-6">
              Solve this to access Parent Mode
            </p>
            
            <div className="text-4xl font-black text-[#1A1A2E] mb-6">
              7 + 5 = ?
            </div>
            
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="?"
              className={`dada-input text-center text-2xl font-black mb-4 ${
                error ? 'border-[#FF6A3D] bg-[#FFB8D0]/20' : ''
              }`}
              autoFocus
            />
            
            {error && (
              <p className="text-[#FF6A3D] font-bold mb-4">
                Try again! 🤔
              </p>
            )}
            
            <button
              onClick={handleUnlock}
              className="dada-button dada-button-primary w-full"
            >
              Unlock
            </button>
            
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#FFB8D0] border-[2px] border-[#1A1A2E] hover:bg-[#FF6A3D] transition-colors"
            >
              <X className="w-4 h-4 text-[#1A1A2E]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
