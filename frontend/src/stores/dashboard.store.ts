import { create } from "zustand";
import type {
  Account,
  CreditUnion,
  GuaranteedLoan,
  LoanAccount,
} from "../types/credit-union.type";

interface DashboardState {
  creditUnions: CreditUnion[];
  selectedCreditUnion: CreditUnion | null;

  setCreditUnions: (creditUnions: CreditUnion[]) => void;
  setSelectedCreditUnion: (creditUnion: CreditUnion | null) => void;
  setSavingsAccounts: (savingsAccounts: Account[]) => void;
  setSharesAccounts: (sharesAccounts: Account[]) => void;
  setFixedDepositAccounts: (fixedDepositAccounts: Account[]) => void;
  setLoanAccounts: (loanAccounts: LoanAccount[]) => void;
  setGuaranteedLoans: (guaranteedLoans: GuaranteedLoan[]) => void;
  clearState: () => void;
}

export const useDashboardStore = create<DashboardState>()(
    (set) => ({
      creditUnions: [],
      selectedCreditUnion: null,

      setSelectedCreditUnion: (creditUnion: CreditUnion | null) =>
        set({ selectedCreditUnion: creditUnion }),
      setCreditUnions: (creditUnions: CreditUnion[]) => set({ creditUnions }),

      setSavingsAccounts: (savingsAccounts: Account[]) =>
        set((state) => {
          if (!state.selectedCreditUnion) return {};

          const updatedCreditUnion = {
            ...state.selectedCreditUnion,
            savingsAccounts,
          };
          return {
            selectedCreditUnion: updatedCreditUnion,
            creditUnions: state.creditUnions.map((cu) =>
              cu.id === updatedCreditUnion.id ? updatedCreditUnion : cu,
            ),
          };
        }),

      setSharesAccounts: (sharesAccounts: Account[]) =>
        set((state) => {
          if (!state.selectedCreditUnion) return {};

          const updatedCreditUnion = {
            ...state.selectedCreditUnion,
            sharesAccounts,
          };
          return {
            selectedCreditUnion: updatedCreditUnion,
            creditUnions: state.creditUnions.map((cu) =>
              cu.id === updatedCreditUnion.id ? updatedCreditUnion : cu,
            ),
          };
        }),
      setFixedDepositAccounts: (fixedDepositAccounts: Account[]) =>
        set((state) => {
          if (!state.selectedCreditUnion) return {};

          const updatedCreditUnion = {
            ...state.selectedCreditUnion,
            fixedDepositAccounts,
          };
          return {
            selectedCreditUnion: updatedCreditUnion,
            creditUnions: state.creditUnions.map((cu) =>
              cu.id === updatedCreditUnion.id ? updatedCreditUnion : cu,
            ),
          };
        }),

      setLoanAccounts: (loanAccounts: LoanAccount[]) =>
        set((state) => {
          if (!state.selectedCreditUnion) return {};

          const updatedCreditUnion = {
            ...state.selectedCreditUnion,
            loanAccounts,
          };
          return {
            selectedCreditUnion: updatedCreditUnion,
            creditUnions: state.creditUnions.map((cu) =>
              cu.id === updatedCreditUnion.id ? updatedCreditUnion : cu,
            ),
          };
        }),

      setGuaranteedLoans: (guaranteedLoans: GuaranteedLoan[]) =>
        set((state) => {
          if (!state.selectedCreditUnion) return {};

          const updatedCreditUnion = {
            ...state.selectedCreditUnion,
            guaranteedLoans,
          };
          return {
            selectedCreditUnion: updatedCreditUnion,
            creditUnions: state.creditUnions.map((cu) =>
              cu.id === updatedCreditUnion.id ? updatedCreditUnion : cu,
            ),
          };
        }),

      clearState: () => set({ creditUnions: [], selectedCreditUnion: null }),
    })
);
