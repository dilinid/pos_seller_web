import type { ReactNode } from 'react';

export type DashboardTab = 'savings' | 'loans' | 'fds' | 'shares' | 'guaranteed';

export type DashboardCommCenterView = 'messages' | 'alerts';

export type TransactionStatus = 'Completed' | 'Pending';
export type TransactionType = 'Credit' | 'Debit';

export interface DashboardTransaction {
  id: number;
  date: string;
  desc: string;
  balance: number;
  amount: number;
  type: TransactionType;
  interest?: number;
  otherCharges?: number;
}

export interface DashboardSelectedAccount {
  accNo: string;
  type: string;
  balanceText: string;
  typeCategory: DashboardTab;
}

export interface DashboardAccountCard {
  tab: DashboardTab;
  title: string;
  description: string;
  icon: ReactNode;
  accentColor: string;
  accentBg: string;
  totalAmount?: string;
}

export interface DashboardSocialLink {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
}

export interface DashboardContactInfo {
  address: string;
  hotline: string;
  socials: DashboardSocialLink[];
}

export interface DashboardMessageItem {
  title: string;
  time: string;
  body: string;
}

export interface DashboardGuaranteedLoan {
  loanNo: string;
  borrower: string;
  name: string;
  balance: number;
  pastDue: number;
  pastDueDays: number;
  interestRate?: number;
  nextDueDate?: string;
}
