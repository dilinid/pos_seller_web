import type { DashboardTab, DashboardTransaction } from './dashboard.types';

export const TRANSACTION_BATCH_SIZE = 6;
export const TRANSACTION_MAX_ITEMS = 36;

export const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const getCreditScore = (membershipType?: string) => {
  if (membershipType === 'Platinum') {
    return 792;
  }

  if (membershipType === 'Gold') {
    return 728;
  }

  return 681;
};

export const getCreditScoreBand = (creditScore: number) => {
  if (creditScore >= 750) {
    return 'Excellent';
  }

  if (creditScore >= 700) {
    return 'Good';
  }

  return 'Fair';
};

export const getMockTransactions = (
  accNo: string,
  category: DashboardTab
): DashboardTransaction[] => {
  const seed = accNo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const savingsDescs = [
    { desc: 'Instacart Grocery Settlement', amount: -142.5, type: 'debit' as const },
    { desc: 'Coop Monthly Payroll Credit', amount: 3250, type: 'credit' as const },
    { desc: 'ATM Cash Withdrawal - Branch #4', amount: -200, type: 'debit' as const },
    { desc: 'Electric Utility Settlement', amount: -65.2, type: 'debit' as const },
    { desc: 'AIB Premium Checking Yield payout', amount: 12.45, type: 'credit' as const },
    { desc: 'Direct Peer-to-Peer Transfer Credit', amount: 80, type: 'credit' as const },
    { desc: 'Subscription Streaming payout', amount: -14.99, type: 'debit' as const },
    { desc: 'Organic Farmers Coop Rebate', amount: 25, type: 'credit' as const },
    { desc: 'Downtown Pharmacy Settlement', amount: -42.8, type: 'debit' as const },
    { desc: 'Cooperative Share Bonus Dividend', amount: 150, type: 'credit' as const },
    { desc: 'Coffee House payment', amount: -4.75, type: 'debit' as const },
    { desc: 'Cooperative Auto fuel rebate', amount: 18.2, type: 'credit' as const },
    { desc: 'Restaurant Dining Settlement', amount: -88.5, type: 'debit' as const },
    { desc: 'Monthly Mobile Account autopay', amount: -45, type: 'debit' as const },
    { desc: 'Cash deposit - Core teller', amount: 500, type: 'credit' as const },
  ];

  const loanDescs = [
    { desc: 'Coop Core Loan Installment payout', amount: -410, type: 'debit' as const },
    { desc: 'Cooperative Principal reduction credit', amount: 350, type: 'credit' as const },
    { desc: 'Installment interest fee applied', amount: -60, type: 'debit' as const },
    { desc: 'Premium Loan insurance premium', amount: -15, type: 'debit' as const },
    { desc: 'Coop Loyalty Principal rebate', amount: 50, type: 'credit' as const },
    { desc: 'Extra manual repayment payout', amount: 100, type: 'credit' as const },
    { desc: 'Loan ledger processing fee', amount: -5, type: 'debit' as const },
    { desc: 'Cooperative Share capital credit transfer', amount: 200, type: 'credit' as const },
    { desc: 'Installment Interest Adjustments', amount: 10, type: 'credit' as const },
    { desc: 'Semi-annual administration surcharge', amount: -12, type: 'debit' as const },
  ];

  const fdDescs = [
    { desc: 'FD Certificate Term Initial placement', amount: 10000, type: 'credit' as const },
    { desc: 'Semi-Annual compounding yield payout', amount: 287.5, type: 'credit' as const },
    { desc: 'Quarterly bonus placement rebate', amount: 50, type: 'credit' as const },
    { desc: 'Compounding yield accrual credit', amount: 142.1, type: 'credit' as const },
    { desc: 'Reinvested payout addition', amount: 200, type: 'credit' as const },
  ];

  const shareDescs = [
    { desc: 'Stock Ledger Equity repurchase', amount: -250, type: 'debit' as const },
    { desc: 'Quarterly stock dividend credit', amount: 78.5, type: 'credit' as const },
    { desc: 'Manual addition portfolio purchase', amount: -500, type: 'debit' as const },
    { desc: 'Aggregated share rebalancing credit', amount: 120, type: 'credit' as const },
    { desc: 'Coop bonus shares distribution', amount: 300, type: 'credit' as const },
    { desc: 'Equity brokerage maintenance surcharge', amount: -8, type: 'debit' as const },
    { desc: 'Stock split equity adjustments', amount: 0, type: 'credit' as const },
  ];

  const items =
    category === 'loans'
      ? loanDescs
      : category === 'fds'
        ? fdDescs
        : category === 'shares'
          ? shareDescs
          : savingsDescs;

  return Array.from({ length: TRANSACTION_MAX_ITEMS }, (_, idx) => {
    const item = items[idx % items.length];
    const cycle = Math.floor(idx / items.length);
    const date = new Date();
    date.setDate(date.getDate() - idx - 2 - cycle);

    return {
      id: `TX-${seed + idx * 179}-${cycle + 1}`,
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      desc: item.desc,
      amount: item.amount,
      type: item.type,
      status: idx === 0 && seed % 3 === 0 ? 'Pending' : 'Completed',
    };
  });
};
