import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CODRequest } from '../types/cod.type';
import type { Order } from '../types/marketplace.type';
import type { UserProfile } from '../types/profile.type';

interface CODStoreState {
  request: CODRequest;
  requestCOD: () => void;
  resetCOD: () => void;
}

const INITIAL_REQUEST: CODRequest = {
  status: 'not_requested',
};

export const useCODStore = create<CODStoreState>()(
  persist(
    (set) => ({
      request: INITIAL_REQUEST,

      requestCOD: () => {
        const now = new Date().toISOString();
        set({
          request: {
            status: 'approved',
            requestedAt: now,
            approvedAt: now,
          },
        });
      },

      resetCOD: () => {
        set({ request: INITIAL_REQUEST });
      },
    }),
    { name: 'cod-request' },
  ),
);

export function checkCODEligibility(user: UserProfile | null, orders: Order[]): {
  criteria: Array<{ key: string; label: string; met: boolean; detail?: string }>;
  allMet: boolean;
} {
  const criteria: Array<{ key: string; label: string; met: boolean; detail?: string }> = [];

  const joinDate = user?.joinDate ? new Date(user.joinDate) : null;
  const accountAgeMs = joinDate ? Date.now() - joinDate.getTime() : 0;
  const accountAgeMonths = accountAgeMs / (1000 * 60 * 60 * 24 * 30);
  const accountMet = joinDate !== null && accountAgeMonths >= 3;
  criteria.push({
    key: 'account_age',
    label: 'Account at least 3 months old',
    met: accountMet,
    detail: joinDate
      ? `${Math.floor(accountAgeMonths)} month${Math.floor(accountAgeMonths) !== 1 ? 's' : ''}`
      : 'No join date',
  });

  const completedOrders = orders.filter((o) =>
    o.items.every((i) => i.status === 'delivered' || i.status === 'completed')
  );
  const completedCount = completedOrders.length;
  const ordersMet = completedCount >= 3;
  criteria.push({
    key: 'completed_orders',
    label: 'At least 3 completed orders',
    met: ordersMet,
    detail: `${completedCount} completed order${completedCount !== 1 ? 's' : ''}`,
  });

  const totalSpent = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const spentMet = totalSpent >= 200;
  criteria.push({
    key: 'total_spent',
    label: 'At least $200 total spent',
    met: spentMet,
    detail: `$${totalSpent.toFixed(2)} spent`,
  });

  const phoneMet = Boolean(user?.phone);
  criteria.push({
    key: 'phone',
    label: 'Phone number on file',
    met: phoneMet,
    detail: phoneMet ? undefined : 'Add your phone number in Profile',
  });

  return { criteria, allMet: accountMet && ordersMet && spentMet && phoneMet };
}
