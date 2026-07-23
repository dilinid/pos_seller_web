import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentAccount } from '../types/payment-account.type';

interface PaymentAccountStoreState {
  paymentAccounts: PaymentAccount[];
  addPaymentAccount: (data: Omit<PaymentAccount, 'id' | 'addedAt'>) => { success: boolean; error?: string };
  removePaymentAccount: (id: string) => void;
}

export const usePaymentAccountStore = create<PaymentAccountStoreState>()(
  persist(
    (set, get) => ({
      paymentAccounts: [],

      addPaymentAccount: (data) => {
        const exists = get().paymentAccounts.some(
          (a) => a.creditUnionId === data.creditUnionId && a.accountNumber === data.accountNumber,
        );
        if (exists) {
          return { success: false, error: 'This account is already linked.' };
        }
        const account: PaymentAccount = {
          ...data,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString(),
        };
        set((s) => ({ paymentAccounts: [...s.paymentAccounts, account] }));
        return { success: true };
      },

      removePaymentAccount: (id) => {
        set((s) => ({ paymentAccounts: s.paymentAccounts.filter((a) => a.id !== id) }));
      },
    }),
    { name: 'payment-accounts' },
  ),
);
