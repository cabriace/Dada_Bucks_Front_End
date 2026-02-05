/**
 * Dada Bucks - Type Definitions
 * 
 * This file contains all the TypeScript interfaces and types for the app.
 * All currency is virtual (Dada Bucks) - NO REAL MONEY INVOLVED.
 */

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  balance: number; // Current spendable Dada Bucks
  savings: number; // Locked savings balance
  savingsInterestAccrued: number; // Partial interest tracked internally (0-99)
  totalEarned: number; // Lifetime earnings
  totalSpent: number; // Lifetime spending
  strikes: number; // Current strikes (0-3)
  pendingEarnings: number; // Earnings waiting for 10 PM deposit
  lastInterestDate: string; // YYYY-MM-DD of last interest payment
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface Task {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  payout: number; // Dada Bucks earned per completion
  dailyMax: number; // Maximum times per day
  completions: number; // Today's completions
  isActive: boolean; // Whether task is currently enabled
  category: TaskCategory;
}

export type TaskCategory = 
  | 'chores' 
  | 'hygiene' 
  | 'learning' 
  | 'helping' 
  | 'other';

// ============================================================================
// SPEND ITEM TYPES
// ============================================================================

export interface SpendItem {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  cost: number; // Cost in Dada Bucks
  quantity: number; // Default quantity
  maxQuantity: number; // Maximum allowed per request
  category: SpendCategory;
  description?: string;
}

export type SpendCategory = 
  | 'screenTime' 
  | 'treats' 
  | 'activities' 
  | 'games';

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType = 'earn' | 'spend' | 'refund' | 'strike_penalty' | 'interest' | 'savings_deposit' | 'savings_withdrawal';

export interface Transaction {
  id: string;
  childId: string;
  type: TransactionType;
  amount: number; // Positive for earn, negative for spend
  description: string;
  timestamp: Date;
  taskId?: string; // If earned from task
  spendItemId?: string; // If spent on item
  approvedBy?: string; // Parent who approved
}

// ============================================================================
// SPEND REQUEST TYPES
// ============================================================================

export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface SpendRequest {
  id: string;
  childId: string;
  items: RequestItem[];
  totalCost: number;
  status: RequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
  respondedBy?: string;
}

// Approved request notification for child view
export interface ApprovedRequestNotification {
  requestId: string;
  items: RequestItem[];
  totalCost: number;
  approvedAt: Date;
  shownToChild: boolean;
}

export interface RequestItem {
  spendItemId: string;
  name: string;
  icon: string;
  cost: number;
  quantity: number;
}

// ============================================================================
// STRIKE TYPES
// ============================================================================

export interface Strike {
  id: string;
  childId: string;
  reason: string;
  timestamp: Date;
  day: string; // YYYY-MM-DD for grouping
}

// ============================================================================
// VAULT TYPES
// ============================================================================

export interface Vault {
  balance: number; // Current vault balance (max 1000)
  maxBalance: number; // Hard cap: 1000
  dailyAllowance: number; // Max spend per day (default 40)
}

// ============================================================================
// AVATAR OPTIONS
// ============================================================================

export const AVATAR_OPTIONS = [
  '👧', '👦', '🧒', '👶', '🧑', 
  '🐶', '🐱', '🐭', '🐹', '🐰',
  '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵',
  '🦄', '🐙', '🦖', '🐲', '👽',
  '🤖', '👻', '👾', '🎃', '🦸'
];

// ============================================================================
// INITIAL DATA CONSTANTS
// ============================================================================

export const DEFAULT_TASKS: Omit<Task, 'id' | 'completions'>[] = [
  { name: 'Clean up after yourself', icon: '🧹', payout: 2, dailyMax: 5, isActive: true, category: 'chores' },
  { name: 'Make bed', icon: '🛏️', payout: 3, dailyMax: 1, isActive: true, category: 'chores' },
  { name: 'Workbook page', icon: '📚', payout: 5, dailyMax: 7, isActive: true, category: 'learning' },
  { name: 'Read a page', icon: '📖', payout: 3, dailyMax: 7, isActive: true, category: 'learning' },
  { name: 'Help with laundry', icon: '👕', payout: 3, dailyMax: 3, isActive: true, category: 'helping' },
  { name: 'Pooper scoop', icon: '💩', payout: 10, dailyMax: 1, isActive: true, category: 'chores' },
  { name: 'Wash dishes', icon: '🍽️', payout: 2, dailyMax: 3, isActive: true, category: 'chores' },
  { name: 'Wipe table', icon: '🧽', payout: 2, dailyMax: 5, isActive: true, category: 'chores' },
  { name: 'Wash hands', icon: '🧼', payout: 1, dailyMax: 10, isActive: true, category: 'hygiene' },
  { name: 'Brush teeth AM', icon: '🪥', payout: 5, dailyMax: 1, isActive: true, category: 'hygiene' },
  { name: 'Brush teeth PM', icon: '🪥', payout: 5, dailyMax: 1, isActive: true, category: 'hygiene' },
];

export const DEFAULT_SPEND_ITEMS: Omit<SpendItem, 'id'>[] = [
  { name: 'Watch a movie', icon: '🎬', cost: 40, quantity: 1, maxQuantity: 1, category: 'screenTime', description: 'Pick a movie to watch' },
  { name: 'Watch TV episode', icon: '📺', cost: 20, quantity: 1, maxQuantity: 3, category: 'screenTime', description: 'Watch your favorite show' },
  { name: 'iPad time', icon: '📱', cost: 1, quantity: 15, maxQuantity: 30, category: 'screenTime', description: 'Minutes of iPad time' },
  { name: 'Junk food', icon: '🍪', cost: 5, quantity: 1, maxQuantity: 3, category: 'treats', description: 'A yummy treat' },
  { name: 'Games', icon: '🎮', cost: 20, quantity: 30, maxQuantity: 60, category: 'games', description: 'Minutes of game time' },
  { name: 'Extra story', icon: '📖', cost: 15, quantity: 1, maxQuantity: 2, category: 'activities', description: 'Bedtime story at bedtime' },
];

export const VAULT_MAX = 1000;
export const DAILY_SPEND_LIMIT = 40;
export const MAX_STRIKES = 3;
export const RESET_HOUR = 22; // 10:00 PM
export const SAVINGS_INTEREST_RATE = 0.01; // 1% daily = 1 DB per 100 saved
