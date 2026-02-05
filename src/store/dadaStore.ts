/**
 * Dada Bucks - Zustand Store
 * 
 * Centralized state management for the entire app.
 * Handles all business logic including:
 * - Task completions and earnings
 * - Strike system
 * - Spend requests and approvals
 * - Transaction history
 * - Vault management
 * - Multi-child support
 * - Savings with interest
 * - 10 PM daily reset
 * 
 * NO REAL MONEY - 100% VIRTUAL CURRENCY
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserRole,
  ChildProfile,
  Task,
  SpendItem,
  Transaction,
  SpendRequest,
  RequestItem,
  Strike,
  Vault,
  ApprovedRequestNotification,
} from '@/types';
import {
  DEFAULT_TASKS,
  DEFAULT_SPEND_ITEMS,
  VAULT_MAX,
  DAILY_SPEND_LIMIT,
  MAX_STRIKES,
  RESET_HOUR,
} from '@/types';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface DadaState {
  // View state
  currentView: UserRole;
  
  // Multi-child support
  children: ChildProfile[];
  currentChildId: string;
  
  // Economy
  vault: Vault;
  
  // Data
  tasks: Task[];
  spendItems: SpendItem[];
  transactions: Transaction[];
  pendingRequests: SpendRequest[];
  requestHistory: SpendRequest[];
  approvedNotifications: ApprovedRequestNotification[];
  strikes: Strike[];
  
  // Parent lock
  isParentLocked: boolean;
  
  // Daily reset tracking
  lastResetDate: string;
}

// ============================================================================
// STORE ACTIONS INTERFACE
// ============================================================================

interface DadaActions {
  // View switching
  setView: (view: UserRole) => void;
  toggleView: () => void;
  
  // Multi-child management
  addChild: (name: string, avatar: string) => string;
  updateChild: (childId: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (childId: string) => void;
  switchChild: (childId: string) => void;
  getCurrentChild: () => ChildProfile;
  
  // Parent lock
  lockParent: () => void;
  unlockParent: (answer: number) => boolean;
  
  // Task management (Parent)
  addTask: (task: Omit<Task, 'id' | 'completions'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskActive: (taskId: string) => void;
  
  // Task completion (Child/Parent)
  completeTask: (taskId: string) => { success: boolean; message: string; earned?: number };
  undoTaskCompletion: (taskId: string) => { success: boolean; message: string };
  
  // Strike system
  addStrike: (reason: string) => { success: boolean; message: string; forfeited?: number };
  removeStrike: (strikeId: string) => void;
  resetStrikes: () => void;
  
  // 10 PM Daily Reset System
  checkAndPerformDailyReset: () => { didReset: boolean; earningsDeposited?: number; interestEarned?: number };
  getNextResetTime: () => Date;
  
  // Savings management
  depositToSavings: (amount: number) => { success: boolean; message: string };
  withdrawFromSavings: (amount: number) => { success: boolean; message: string };
  calculateDailyInterest: (savingsBalance: number) => { wholeAmount: number; newAccrued: number };
  
  // Spend requests (Child)
  createSpendRequest: (items: RequestItem[]) => { success: boolean; message: string; requestId?: string };
  cancelSpendRequest: (requestId: string) => void;
  
  // Spend approval (Parent)
  approveRequest: (requestId: string) => { success: boolean; message: string };
  denyRequest: (requestId: string) => void;
  
  // Approved request notifications (for child view)
  markNotificationShown: (requestId: string) => void;
  getUnshownApprovedRequests: () => ApprovedRequestNotification[];
  
  // Vault management
  addToVault: (amount: number) => void;
  removeFromVault: (amount: number) => boolean;
  
  // Transaction history
  getTodayTransactions: () => Transaction[];
  getChildTransactions: (childId?: string) => Transaction[];
  
  // Stats
  getTodayStats: () => { earned: number; spent: number; strikes: number };
  
  // Reset
  resetAll: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getCurrentDateTime = () => new Date();

const shouldResetToday = (lastResetDate: string): boolean => {
  const now = getCurrentDateTime();
  const lastReset = new Date(lastResetDate + 'T' + RESET_HOUR + ':00:00');
  const todayReset = new Date();
  todayReset.setHours(RESET_HOUR, 0, 0, 0);
  
  // If it's past 10 PM today and last reset was before today's 10 PM
  if (now >= todayReset && lastReset < todayReset) {
    return true;
  }
  
  // If last reset was before yesterday's 10 PM (missed a day)
  const yesterdayReset = new Date(todayReset);
  yesterdayReset.setDate(yesterdayReset.getDate() - 1);
  if (lastReset < yesterdayReset) {
    return true;
  }
  
  return false;
};

const createDefaultChild = (name: string = 'Alex', avatar: string = '👧'): ChildProfile => ({
  id: `child-${generateId()}`,
  name,
  avatar,
  balance: 0,
  savings: 0,
  savingsInterestAccrued: 0,
  totalEarned: 0,
  totalSpent: 0,
  strikes: 0,
  pendingEarnings: 0,
  lastInterestDate: getTodayDate(),
});

const createDefaultVault = (): Vault => ({
  balance: 1000,
  maxBalance: VAULT_MAX,
  dailyAllowance: DAILY_SPEND_LIMIT,
});

const createInitialTasks = (): Task[] =>
  DEFAULT_TASKS.map((task, index) => ({
    ...task,
    id: `task-${index}`,
    completions: 0,
  }));

const createInitialSpendItems = (): SpendItem[] =>
  DEFAULT_SPEND_ITEMS.map((item, index) => ({
    ...item,
    id: `spend-${index}`,
  }));

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDadaStore = create<DadaState & DadaActions>()(
  persist(
    (set, get) => ({
      // ======================================================================
      // INITIAL STATE - ALL ZEROS, VAULT AT 1000
      // ======================================================================
      
      currentView: 'parent',
      children: [createDefaultChild()],
      currentChildId: '',
      vault: createDefaultVault(),
      tasks: createInitialTasks(),
      spendItems: createInitialSpendItems(),
      transactions: [],
      pendingRequests: [],
      requestHistory: [],
      approvedNotifications: [],
      strikes: [],
      isParentLocked: false,
      lastResetDate: getTodayDate(),
      
      // ======================================================================
      // VIEW ACTIONS
      // ======================================================================
      
      setView: (view) => set({ currentView: view }),
      
      toggleView: () => {
        const { currentView } = get();
        set({ currentView: currentView === 'parent' ? 'child' : 'parent' });
      },
      
      // ======================================================================
      // MULTI-CHILD MANAGEMENT
      // ======================================================================
      
      addChild: (name, avatar) => {
        const newChild = createDefaultChild(name, avatar);
        set((state) => ({
          children: [...state.children, newChild],
        }));
        return newChild.id;
      },
      
      updateChild: (childId, updates) => {
        set((state) => ({
          children: state.children.map((child) =>
            child.id === childId ? { ...child, ...updates } : child
          ),
        }));
      },
      
      deleteChild: (childId) => {
        const { children, currentChildId } = get();
        if (children.length <= 1) {
          return; // Can't delete the last child
        }
        const newChildren = children.filter((c) => c.id !== childId);
        set({
          children: newChildren,
          currentChildId: currentChildId === childId ? newChildren[0].id : currentChildId,
        });
      },
      
      switchChild: (childId) => {
        set({ currentChildId: childId });
      },
      
      getCurrentChild: () => {
        const { children, currentChildId } = get();
        return children.find((c) => c.id === currentChildId) || children[0];
      },
      
      // ======================================================================
      // PARENT LOCK
      // ======================================================================
      
      lockParent: () => set({ isParentLocked: true }),
      
      unlockParent: (answer) => {
        const correct = 12;
        if (answer === correct) {
          set({ isParentLocked: false });
          return true;
        }
        return false;
      },
      
      // ======================================================================
      // TASK MANAGEMENT (PARENT)
      // ======================================================================
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: `task-${generateId()}`,
          completions: 0,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },
      
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      
      toggleTaskActive: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, isActive: !task.isActive } : task
          ),
        }));
      },
      
      // ======================================================================
      // TASK COMPLETION (CHILD/PARENT) - EARNINGS GO TO PENDING
      // ======================================================================
      
      completeTask: (taskId) => {
        const { tasks, vault, strikes, children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        const task = tasks.find((t) => t.id === taskId);
        
        if (!task) {
          return { success: false, message: 'Task not found' };
        }
        
        if (!task.isActive) {
          return { success: false, message: 'This task is not active' };
        }
        
        // Check strikes - CANNOT earn if 3 strikes
        const todayStrikes = strikes.filter(
          (s) => s.day === getTodayDate() && s.childId === child.id
        ).length;
        
        if (todayStrikes >= MAX_STRIKES) {
          return { 
            success: false, 
            message: `Cannot earn - ${MAX_STRIKES} strikes today! All earnings forfeited.` 
          };
        }
        
        // Check daily max
        if (task.completions >= task.dailyMax) {
          return { 
            success: false, 
            message: `Daily limit reached (${task.dailyMax}/${task.dailyMax})` 
          };
        }
        
        // Check vault has enough
        if (vault.balance < task.payout) {
          return { success: false, message: 'Vault is empty! Add more Dada Bucks.' };
        }
        
        // Complete the task - earnings go to PENDING (not balance yet)
        const earned = task.payout;
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completions: t.completions + 1 } : t
          ),
          children: state.children.map((c) =>
            c.id === child.id
              ? { ...c, pendingEarnings: c.pendingEarnings + earned }
              : c
          ),
          vault: {
            ...state.vault,
            balance: state.vault.balance - earned,
          },
        }));
        
        return { 
          success: true, 
          message: `Great job! ${earned} Dada Bucks will be added at 10 PM!`,
          earned 
        };
      },
      
      undoTaskCompletion: (taskId) => {
        const { tasks, children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        const task = tasks.find((t) => t.id === taskId);
        
        if (!task || task.completions <= 0) {
          return { success: false, message: 'No completions to undo' };
        }
        
        const earned = task.payout;
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completions: t.completions - 1 } : t
          ),
          children: state.children.map((c) =>
            c.id === child.id
              ? { ...c, pendingEarnings: Math.max(0, c.pendingEarnings - earned) }
              : c
          ),
          vault: {
            ...state.vault,
            balance: Math.min(VAULT_MAX, state.vault.balance + earned),
          },
        }));
        
        return { success: true, message: 'Task completion undone' };
      },
      
      // ======================================================================
      // STRIKE SYSTEM
      // ======================================================================
      
      addStrike: (reason) => {
        const { children, currentChildId, strikes } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        const today = getTodayDate();
        const todayStrikes = strikes.filter((s) => s.day === today && s.childId === child.id).length;
        
        if (todayStrikes >= MAX_STRIKES) {
          return { success: false, message: 'Maximum strikes already reached today' };
        }
        
        const newStrike: Strike = {
          id: `strike-${generateId()}`,
          childId: child.id,
          reason,
          timestamp: new Date(),
          day: today,
        };
        
        const newStrikeCount = todayStrikes + 1;
        let forfeited = 0;
        
        // If this is the 3rd strike, FORFEIT all pending earnings
        if (newStrikeCount >= MAX_STRIKES) {
          forfeited = child.pendingEarnings;
          
          const penaltyTransaction: Transaction = {
            id: `txn-${generateId()}`,
            childId: child.id,
            type: 'strike_penalty',
            amount: -forfeited,
            description: '3 strikes - All pending earnings forfeited!',
            timestamp: new Date(),
          };
          
          set((state) => ({
            strikes: [...state.strikes, newStrike],
            children: state.children.map((c) =>
              c.id === child.id
                ? { ...c, pendingEarnings: 0 }
                : c
            ),
            vault: {
              ...state.vault,
              balance: Math.min(VAULT_MAX, state.vault.balance + forfeited),
            },
            transactions: forfeited > 0 
              ? [penaltyTransaction, ...state.transactions]
              : state.transactions,
          }));
          
          return { 
            success: true, 
            message: `⚠️ 3 STRIKES! All pending earnings (${forfeited} DB) forfeited!`,
            forfeited 
          };
        }
        
        set((state) => ({
          strikes: [...state.strikes, newStrike],
        }));
        
        return { 
          success: true, 
          message: `Strike ${newStrikeCount} of ${MAX_STRIKES}. ${MAX_STRIKES - newStrikeCount} more and earnings are forfeited!` 
        };
      },
      
      removeStrike: (strikeId) => {
        set((state) => ({
          strikes: state.strikes.filter((s) => s.id !== strikeId),
        }));
      },
      
      resetStrikes: () => {
        set({ strikes: [] });
      },
      
      // ======================================================================
      // 10 PM DAILY RESET SYSTEM
      // ======================================================================
      
      checkAndPerformDailyReset: () => {
        const { lastResetDate, children, strikes } = get();
        
        if (!shouldResetToday(lastResetDate)) {
          return { didReset: false };
        }
        
        let totalEarningsDeposited = 0;
        let totalInterestEarned = 0;
        const today = getTodayDate();
        const newTransactions: Transaction[] = [];
        
        // Process each child
        const updatedChildren = children.map((child) => {
          // 1. Deposit pending earnings to balance
          const pendingEarnings = child.pendingEarnings;
          let newBalance = child.balance;
          let newTotalEarned = child.totalEarned;
          
          if (pendingEarnings > 0) {
            newBalance += pendingEarnings;
            newTotalEarned += pendingEarnings;
            totalEarningsDeposited += pendingEarnings;
            
            newTransactions.push({
              id: `txn-${generateId()}`,
              childId: child.id,
              type: 'earn',
              amount: pendingEarnings,
              description: `Daily deposit: ${pendingEarnings} Dada Bucks earned today`,
              timestamp: new Date(),
            });
          }
          
          // 2. Calculate and pay savings interest
          const { wholeAmount, newAccrued } = get().calculateDailyInterest(child.savings);
          let newSavings = child.savings;
          
          if (wholeAmount > 0) {
            newSavings += wholeAmount;
            totalInterestEarned += wholeAmount;
            
            newTransactions.push({
              id: `txn-${generateId()}`,
              childId: child.id,
              type: 'interest',
              amount: wholeAmount,
              description: `Savings interest: +${wholeAmount} Dada Bucks`,
              timestamp: new Date(),
            });
          }
          
          return {
            ...child,
            balance: newBalance,
            savings: newSavings,
            savingsInterestAccrued: newAccrued,
            pendingEarnings: 0,
            totalEarned: newTotalEarned,
            lastInterestDate: today,
          };
        });
        
        // 3. Reset task completions
        const updatedTasks = get().tasks.map((task) => ({ ...task, completions: 0 }));
        
        // 4. Clear strikes for new day
        const todayStrikes = strikes.filter((s) => s.day === today);
        
        set({
          children: updatedChildren,
          tasks: updatedTasks,
          strikes: todayStrikes, // Keep only today's strikes (should be none after reset)
          lastResetDate: today,
          transactions: [...newTransactions, ...get().transactions],
        });
        
        return { 
          didReset: true, 
          earningsDeposited: totalEarningsDeposited,
          interestEarned: totalInterestEarned 
        };
      },
      
      getNextResetTime: () => {
        const now = getCurrentDateTime();
        const nextReset = new Date();
        nextReset.setHours(RESET_HOUR, 0, 0, 0);
        
        if (now >= nextReset) {
          nextReset.setDate(nextReset.getDate() + 1);
        }
        
        return nextReset;
      },
      
      // ======================================================================
      // SAVINGS MANAGEMENT WITH INTEREST
      // ======================================================================
      
      depositToSavings: (amount) => {
        const { children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        
        if (amount <= 0) {
          return { success: false, message: 'Amount must be positive' };
        }
        
        if (amount > child.balance) {
          return { success: false, message: `Not enough balance. You have ${child.balance} DB` };
        }
        
        const transaction: Transaction = {
          id: `txn-${generateId()}`,
          childId: child.id,
          type: 'savings_deposit',
          amount: -amount,
          description: `Moved ${amount} DB to savings`,
          timestamp: new Date(),
        };
        
        set((state) => ({
          children: state.children.map((c) =>
            c.id === child.id
              ? { ...c, balance: c.balance - amount, savings: c.savings + amount }
              : c
          ),
          transactions: [transaction, ...state.transactions],
        }));
        
        return { success: true, message: `Moved ${amount} DB to savings!` };
      },
      
      withdrawFromSavings: (amount) => {
        const { children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        
        if (amount <= 0) {
          return { success: false, message: 'Amount must be positive' };
        }
        
        if (amount > child.savings) {
          return { success: false, message: `Not enough savings. You have ${child.savings} DB` };
        }
        
        const transaction: Transaction = {
          id: `txn-${generateId()}`,
          childId: child.id,
          type: 'savings_withdrawal',
          amount: amount,
          description: `Withdrew ${amount} DB from savings`,
          timestamp: new Date(),
        };
        
        set((state) => ({
          children: state.children.map((c) =>
            c.id === child.id
              ? { ...c, balance: c.balance + amount, savings: c.savings - amount }
              : c
          ),
          transactions: [transaction, ...state.transactions],
        }));
        
        return { success: true, message: `Withdrew ${amount} DB from savings!` };
      },
      
      calculateDailyInterest: (savingsBalance) => {
        // 1 DB per 100 saved = 0.01 rate
        // Track partial interest internally
        const dailyRate = 0.01;
        const interest = savingsBalance * dailyRate;
        const wholeAmount = Math.floor(interest);
        const fractionalPart = interest - wholeAmount;
        
        return { wholeAmount, newAccrued: Math.round(fractionalPart * 100) };
      },
      
      // ======================================================================
      // SPEND REQUESTS (CHILD)
      // ======================================================================
      
      createSpendRequest: (items) => {
        const { children, currentChildId, pendingRequests } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        
        // Check if already has pending request
        const existingPending = pendingRequests.filter(
          (r) => r.childId === child.id && r.status === 'pending'
        );
        
        if (existingPending.length > 0) {
          return { 
            success: false, 
            message: 'You already have a pending request! Wait for parent approval.' 
          };
        }
        
        const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);
        
        if (totalCost > child.balance) {
          return { 
            success: false, 
            message: `Not enough Dada Bucks! You have ${child.balance}, need ${totalCost}` 
          };
        }
        
        const newRequest: SpendRequest = {
          id: `req-${generateId()}`,
          childId: child.id,
          items,
          totalCost,
          status: 'pending',
          requestedAt: new Date(),
        };
        
        set((state) => ({
          pendingRequests: [...state.pendingRequests, newRequest],
        }));
        
        return { 
          success: true, 
          message: 'Request sent to parent for approval!',
          requestId: newRequest.id 
        };
      },
      
      cancelSpendRequest: (requestId) => {
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
        }));
      },
      
      // ======================================================================
      // SPEND APPROVAL (PARENT) - WITH NOTIFICATION FOR CHILD
      // ======================================================================
      
      approveRequest: (requestId) => {
        const { pendingRequests, children } = get();
        const request = pendingRequests.find((r) => r.id === requestId);
        
        if (!request) {
          return { success: false, message: 'Request not found' };
        }
        
        const child = children.find((c) => c.id === request.childId);
        if (!child) {
          return { success: false, message: 'Child not found' };
        }
        
        if (request.totalCost > child.balance) {
          get().denyRequest(requestId);
          return { success: false, message: 'Child no longer has enough balance' };
        }
        
        const transaction: Transaction = {
          id: `txn-${generateId()}`,
          childId: child.id,
          type: 'spend',
          amount: -request.totalCost,
          description: `Spent: ${request.items.map((i) => i.name).join(', ')}`,
          timestamp: new Date(),
        };
        
        const updatedRequest: SpendRequest = {
          ...request,
          status: 'approved',
          respondedAt: new Date(),
        };
        
        // Create notification for child view
        const notification: ApprovedRequestNotification = {
          requestId: request.id,
          items: request.items,
          totalCost: request.totalCost,
          approvedAt: new Date(),
          shownToChild: false,
        };
        
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
          requestHistory: [updatedRequest, ...state.requestHistory],
          approvedNotifications: [notification, ...state.approvedNotifications],
          children: state.children.map((c) =>
            c.id === child.id
              ? { 
                  ...c, 
                  balance: c.balance - request.totalCost,
                  totalSpent: c.totalSpent + request.totalCost 
                }
              : c
          ),
          vault: {
            ...state.vault,
            balance: Math.min(VAULT_MAX, state.vault.balance + request.totalCost),
          },
          transactions: [transaction, ...state.transactions],
        }));
        
        return { success: true, message: 'Request approved!' };
      },
      
      denyRequest: (requestId) => {
        const { pendingRequests } = get();
        const request = pendingRequests.find((r) => r.id === requestId);
        
        if (!request) return;
        
        const updatedRequest: SpendRequest = {
          ...request,
          status: 'denied',
          respondedAt: new Date(),
        };
        
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
          requestHistory: [updatedRequest, ...state.requestHistory],
        }));
      },
      
      // ======================================================================
      // APPROVED REQUEST NOTIFICATIONS (FOR CHILD VIEW)
      // ======================================================================
      
      markNotificationShown: (requestId) => {
        set((state) => ({
          approvedNotifications: state.approvedNotifications.map((n) =>
            n.requestId === requestId ? { ...n, shownToChild: true } : n
          ),
        }));
      },
      
      getUnshownApprovedRequests: () => {
        const { approvedNotifications } = get();
        
        return approvedNotifications.filter(
          (n) => !n.shownToChild && n.items.length > 0
        );
      },
      
      // ======================================================================
      // VAULT MANAGEMENT
      // ======================================================================
      
      addToVault: (amount) => {
        set((state) => ({
          vault: {
            ...state.vault,
            balance: Math.min(VAULT_MAX, state.vault.balance + amount),
          },
        }));
      },
      
      removeFromVault: (amount) => {
        const { vault } = get();
        if (vault.balance < amount) return false;
        
        set((state) => ({
          vault: {
            ...state.vault,
            balance: state.vault.balance - amount,
          },
        }));
        return true;
      },
      
      // ======================================================================
      // TRANSACTION HISTORY
      // ======================================================================
      
      getTodayTransactions: () => {
        const { transactions, children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        const today = new Date().toDateString();
        return transactions.filter(
          (t) => new Date(t.timestamp).toDateString() === today && t.childId === child.id
        );
      },
      
      getChildTransactions: (childId?) => {
        const { transactions, children, currentChildId } = get();
        const targetChildId = childId || currentChildId || children[0]?.id;
        return transactions.filter((t) => t.childId === targetChildId);
      },
      
      // ======================================================================
      // STATS
      // ======================================================================
      
      getTodayStats: () => {
        const { transactions, strikes, children, currentChildId } = get();
        const child = children.find((c) => c.id === currentChildId) || children[0];
        const today = getTodayDate();
        
        const todayTransactions = transactions.filter(
          (t) => new Date(t.timestamp).toISOString().split('T')[0] === today && t.childId === child.id
        );
        
        const earned = todayTransactions
          .filter((t) => t.type === 'earn' || t.type === 'interest')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const spent = todayTransactions
          .filter((t) => t.type === 'spend')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const todayStrikes = strikes.filter((s) => s.day === today && s.childId === child.id).length;
        
        return { earned, spent, strikes: todayStrikes };
      },
      
      // ======================================================================
      // RESET
      // ======================================================================
      
      resetAll: () => {
        set({
          currentView: 'parent',
          children: [createDefaultChild()],
          currentChildId: '',
          vault: createDefaultVault(),
          tasks: createInitialTasks(),
          spendItems: createInitialSpendItems(),
          transactions: [],
          pendingRequests: [],
          requestHistory: [],
          approvedNotifications: [],
          strikes: [],
          isParentLocked: false,
          lastResetDate: getTodayDate(),
        });
      },
    }),
    {
      name: 'dada-bucks-storage',
      partialize: (state) => ({
        children: state.children,
        currentChildId: state.currentChildId,
        vault: state.vault,
        tasks: state.tasks,
        spendItems: state.spendItems,
        transactions: state.transactions,
        pendingRequests: state.pendingRequests,
        requestHistory: state.requestHistory,
        approvedNotifications: state.approvedNotifications,
        strikes: state.strikes,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);

export default useDadaStore;
