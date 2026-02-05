/**
 * ChildSelector Component
 * 
 * Allows parents to:
 * - Switch between children
 * - Add new children
 * - Edit child name and avatar
 */

import { useState } from 'react';
import { useDadaStore } from '@/store/dadaStore';
import { AVATAR_OPTIONS } from '@/types';
import { Plus, Edit2, Check, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export function ChildSelector() {
  const { children, currentChildId, switchChild, addChild, updateChild } = useDadaStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Form states
  const [newChildName, setNewChildName] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState(AVATAR_OPTIONS[0]);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const currentChild = children.find(c => c.id === currentChildId) || children[0];

  const handleAddChild = () => {
    if (!newChildName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    const newId = addChild(newChildName.trim(), newChildAvatar);
    switchChild(newId);
    setNewChildName('');
    setNewChildAvatar(AVATAR_OPTIONS[0]);
    setShowAddForm(false);
    toast.success(`Added ${newChildName}!`);
  };

  const handleEditChild = () => {
    if (!editName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    updateChild(currentChild.id, { name: editName.trim(), avatar: editAvatar });
    setShowEditForm(false);
    toast.success('Updated!');
  };

  const startEdit = () => {
    setEditName(currentChild.name);
    setEditAvatar(currentChild.avatar);
    setShowEditForm(true);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Current Child Display */}
      {!showAddForm && !showEditForm && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="dada-card bg-white px-4 py-3 flex items-center gap-3 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentChild?.avatar}</span>
              <span className="font-black text-lg text-[#1A1A2E]">{currentChild?.name}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#6B6B8C] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={startEdit}
            className="w-12 h-12 rounded-xl bg-[#A6EFFF] border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E] flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_6px_0_#1A1A2E] active:translate-y-[2px] active:shadow-[0_2px_0_#1A1A2E] transition-all"
          >
            <Edit2 className="w-5 h-5 text-[#1A1A2E]" />
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="w-12 h-12 rounded-xl bg-[#B8FFC9] border-[3px] border-[#1A1A2E] shadow-[0_4px_0_#1A1A2E] flex items-center justify-center hover:translate-y-[-2px] hover:shadow-[0_6px_0_#1A1A2E] active:translate-y-[2px] active:shadow-[0_2px_0_#1A1A2E] transition-all"
          >
            <Plus className="w-6 h-6 text-[#1A1A2E]" />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {showDropdown && !showAddForm && !showEditForm && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border-[3px] border-[#1A1A2E] rounded-2xl shadow-[0_8px_0_#1A1A2E] z-50 overflow-hidden">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                switchChild(child.id);
                setShowDropdown(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#FFF6D6] transition-colors ${
                child.id === currentChildId ? 'bg-[#FFF6D6]' : ''
              }`}
            >
              <span className="text-2xl">{child.avatar}</span>
              <span className="font-bold text-[#1A1A2E]">{child.name}</span>
              {child.id === currentChildId && (
                <span className="ml-auto text-xs bg-[#FFD200] px-2 py-1 rounded-full font-bold">Active</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add Child Form */}
      {showAddForm && (
        <div className="dada-card bg-[#FFF6D6] p-6 max-w-md mx-auto">
          <h3 className="card-title mb-4 text-center">Add New Child</h3>
          
          <div className="mb-4">
            <label className="dada-label mb-2 block">Name</label>
            <input
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="Enter name..."
              className="dada-input"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="dada-label mb-2 block">Choose Avatar</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-xl border-[2px] border-[#1A1A2E]">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setNewChildAvatar(avatar)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    newChildAvatar === avatar
                      ? 'bg-[#FFD200] border-[2px] border-[#1A1A2E]'
                      : 'hover:bg-[#FFF6D6]'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleAddChild} className="flex-1 dada-button dada-button-success">
              <Check className="w-4 h-4 mr-2" />
              Add
            </button>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setNewChildName('');
              }} 
              className="flex-1 dada-button dada-button-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Child Form */}
      {showEditForm && (
        <div className="dada-card bg-[#A6EFFF] p-6 max-w-md mx-auto">
          <h3 className="card-title mb-4 text-center">Edit Child</h3>
          
          <div className="mb-4">
            <label className="dada-label mb-2 block">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="dada-input"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="dada-label mb-2 block">Choose Avatar</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-xl border-[2px] border-[#1A1A2E]">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setEditAvatar(avatar)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    editAvatar === avatar
                      ? 'bg-[#FFD200] border-[2px] border-[#1A1A2E]'
                      : 'hover:bg-[#FFF6D6]'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={handleEditChild} className="flex-1 dada-button dada-button-success">
              <Check className="w-4 h-4 mr-2" />
              Save
            </button>
            <button 
              onClick={() => setShowEditForm(false)} 
              className="flex-1 dada-button dada-button-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
