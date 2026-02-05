/**
 * SpendSection Component (Child View)
 * 
 * Shows:
 * - Spendable item cards
 * - Quantity selectors
 * - Cart summary
 * - Submit request button
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import type { SpendItem, RequestItem } from '@/types';
import { Plus, Minus, ShoppingCart, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function SpendSection() {
  const { 
    spendItems, 
    children,
    currentChildId,
    pendingRequests,
    createSpendRequest 
  } = useDadaStore();

  const child = children.find(c => c.id === currentChildId) || children[0];

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  if (!child) {
    return (
      <div className="text-center text-white">
        <p>No child profile found.</p>
      </div>
    );
  }

  // Check if there's a pending request
  const pendingRequest = pendingRequests.find(
    r => r.childId === child.id && r.status === 'pending'
  );

  const handleQuantityChange = (itemId: string, delta: number, maxQuantity: number) => {
    setQuantities(prev => {
      const current = prev[itemId] || 0;
      const newQuantity = Math.max(0, Math.min(current + delta, maxQuantity));
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const cartItems: RequestItem[] = spendItems
    .filter(item => (quantities[item.id] || 0) > 0)
    .map(item => ({
      spendItemId: item.id,
      name: item.name,
      icon: item.icon,
      cost: item.cost,
      quantity: quantities[item.id],
    }));

  const totalCost = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);
  const canAfford = totalCost <= child.balance;

  const handleSubmit = () => {
    if (cartItems.length === 0) {
      toast.error('Select some items first!');
      return;
    }
    if (!canAfford) {
      toast.error(`Not enough Dada Bucks! You need ${totalCost}, have ${child.balance}`);
      return;
    }

    const result = createSpendRequest(cartItems);
    if (result.success) {
      toast.success('Request sent to parent!', { icon: '📨' });
      setQuantities({});
      setShowCart(false);
    } else {
      toast.error(result.message);
    }
  };

  // If there's a pending request, show waiting state
  if (pendingRequest) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="section-title text-white">Spend Shop</h2>
          <p className="text-white/80 font-bold">
            Trade Dada Bucks for fun rewards
          </p>
        </div>

        <div className="dada-card bg-[#FFD200] p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-[4px] border-[#1A1A2E] shadow-[0_8px_0_#1A1A2E]">
            <Clock className="w-10 h-10 text-[#1A1A2E] animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-[#1A1A2E] mb-2">
            Waiting for Parent
          </h3>
          <p className="text-[#1A1A2E] font-bold mb-4">
            You have a pending request for {pendingRequest.totalCost} Dada Bucks
          </p>
          <div className="bg-white rounded-xl p-4 border-[3px] border-[#1A1A2E]">
            <p className="font-bold text-[#6B6B8C] mb-2">Items:</p>
            {pendingRequest.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center gap-2 py-1">
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-[#1A1A2E]">{item.name}</span>
                {item.quantity > 1 && <span className="text-sm text-[#6B6B8C]">x{item.quantity}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="section-title text-white">Spend Shop</h2>
        <p className="text-white/80 font-bold">
          Trade Dada Bucks for fun rewards
        </p>
      </div>

      {/* Balance Display */}
      <div className="dada-card dada-card-mint p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <span className="font-bold text-[#1A1A2E]">Your Balance:</span>
        </div>
        <span className="text-3xl font-black text-[#15803d]">{child.balance} DB</span>
      </div>

      {/* Shop Items */}
      <div className="grid gap-4">
        {spendItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            quantity={quantities[item.id] || 0}
            onIncrease={() => handleQuantityChange(item.id, 1, item.maxQuantity)}
            onDecrease={() => handleQuantityChange(item.id, -1, item.maxQuantity)}
          />
        ))}
      </div>

      {/* Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 dada-button dada-button-primary shadow-[0_8px_0_#1A1A2E] z-30"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          View Cart ({cartItems.length}) - {totalCost} DB
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-[#1A1A2E]/90 flex items-center justify-center z-50 p-4">
          <div className="dada-card bg-white w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b-[3px] border-[#1A1A2E]">
              <h3 className="card-title mb-0">Your Cart</h3>
              <button 
                onClick={() => setShowCart(false)}
                className="w-10 h-10 bg-[#FFB8D0] rounded-lg flex items-center justify-center border-[3px] border-[#1A1A2E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#FFF6D6] rounded-xl p-3 border-[2px] border-[#1A1A2E]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-bold text-[#1A1A2E]">{item.name}</p>
                      <p className="text-sm text-[#6B6B8C] font-bold">
                        {item.cost} DB x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-[#1A1A2E]">{item.cost * item.quantity} DB</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-[3px] border-[#1A1A2E] bg-[#FFF6D6]">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-[#1A1A2E]">Total:</span>
                <span className={`text-2xl font-black ${canAfford ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>
                  {totalCost} DB
                </span>
              </div>

              {!canAfford && (
                <p className="text-[#dc2626] font-bold text-center mb-4">
                  You need {totalCost - child.balance} more Dada Bucks!
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canAfford}
                className={`w-full dada-button ${canAfford ? 'dada-button-success' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                <Check className="w-5 h-5 mr-2" />
                Send to Parent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shop Item Card Component
interface ShopItemCardProps {
  item: SpendItem;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

function ShopItemCard({ item, quantity, onIncrease, onDecrease }: ShopItemCardProps) {
  return (
    <div className="dada-card bg-white p-4">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="text-4xl flex-shrink-0">{item.icon}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-lg text-[#1A1A2E] truncate">{item.name}</h4>
          <p className="text-sm text-[#6B6B8C] font-bold">{item.description}</p>
          <p className="text-[#15803d] font-black">{item.cost} DB each</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {quantity > 0 && (
            <>
              <button
                onClick={onDecrease}
                className="w-10 h-10 rounded-xl bg-[#FFB8D0] border-[3px] border-[#1A1A2E] shadow-[0_3px_0_#1A1A2E] flex items-center justify-center active:translate-y-[3px] active:shadow-none transition-all"
              >
                <Minus className="w-5 h-5 text-[#1A1A2E]" />
              </button>
              <span className="w-8 text-center font-black text-xl text-[#1A1A2E]">{quantity}</span>
            </>
          )}
          <button
            onClick={onIncrease}
            disabled={quantity >= item.maxQuantity}
            className={`w-12 h-12 rounded-xl border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E] flex items-center justify-center transition-all ${
              quantity >= item.maxQuantity
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-[#B8FFC9] active:translate-y-[4px] active:shadow-none'
            }`}
          >
            <Plus className="w-6 h-6 text-[#1A1A2E]" />
          </button>
        </div>
      </div>

      {/* Max indicator */}
      {quantity > 0 && quantity >= item.maxQuantity && (
        <p className="text-xs text-[#dc2626] font-bold mt-2 text-right">
          Max reached!
        </p>
      )}
    </div>
  );
}
