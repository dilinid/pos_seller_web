import type { TransactionType } from "../pages/dashboard/dashboard.types";

export interface CreditUnion {
  id: number;
  userMasterId: number;
  activeStatus: boolean;
  instituteId: number;
  nameLn1: string;
  logo?: string;
  image?: string;
  phone?: string;
  hotline?: string;
  email?: string;
  ciCustomerId?: number;
  customerCode?: string;
  accountCount: number;
  description?: string;
  address?: string;
  swiftCode?: string;
  eligibleCriteria?: string;
  clientServer?: string;
  aibApiVersion?: string;
  socialMediaLinks?: SocialMediaLink;
  accountTypeCount: AccountTypeCount[];
  savingsAccounts?: Account[];
  sharesAccounts?: Account[];
  fixedDepositAccounts?: Account[];
  loanAccounts?: LoanAccount[];
  guaranteedLoans?: GuaranteedLoan[];
}

export interface SocialMediaLink extends Record<string, string> {
  facebookUrl : string;
  instagramUrl : string;
  youtubeUrl : string;
  webSiteUrl : string;
}

export interface Transaction {
  id: number;
  balance: number;
  total: number;
  type: TransactionType;
  date: string;
  interest: number;
  description: string;
  insurence: number;
  fee: number;
  penalty: number;
  updatedDate: string;
}

export interface AccountTypeCount {
  accountType: string;
  count: number;
  totalBalance: number;
}

export interface AccountBase{
  refAccountNumber: string;
  nameLn1: string;
  totalBalance: number;
  type?: string;
  transactions?: Transaction[];
}

export interface Account extends AccountBase{
  plAccountId: number;
  intrestRate: number;
  openDate: string;
  renewDate: string;
}

export type LoanStatus = "DISBURSED" | "APPROVED" | "CLOSED" 

export interface LoanAccount extends AccountBase {
    capital: number;
    loanStatus: number;
    penalty: number;
    interest: number;
    fee: number;
    pastDue: number;
    pastDueDays: number;
    pastDueAmount: number;
    balanceDetail: number;
    capitalInstallment: number;
    branchId: number;
}

export interface GuaranteedLoan {
  nameLn1: string;
    customerName: string;
    refAccountNumber: string;
    balance: number;
    dueInterest: number;
    penalty: number;
    sumBalance: number;
    capital: number;
    pastDueAmount: number;
    pastDueDays: number;
}

export interface CreditUnionResponse {
  id: number;
  user_master_id: number;
  activeStatus: boolean;
  institute_id: number;
  name_ln1: string;
  logo: string;
  image: string;
  phone: string;
  hot_line: string;
  email: string;
  institute_user_id: number;
  customer_number: string;
  accountCount: number;
  address: string;
  swiftCode: string;
  eligibleCriteria: string;
  clientServer: string;
  aibApiVersion: string;
  socialMediaLinks: SocialMediaLink;
  accountTypeCount: AccountTypeCount[];
}

export interface AccountResponse {
  plAccountId: number;
  ref_account_number: string;
  name_ln1: string;
  total_balance: number;
  interestRate: number;
  openDate: string;
  renewDate: string;
}

export interface GuaranteedLoanResponse {
    nameLn1: string;
    customerName: string;
    ref_account_number: string;
    balance: number;
    due_interest: number;
    penalty: number;
    sum_balance: number;
    capital: number;
    pastDueAmount: number;
    pastDueDays: number;
}