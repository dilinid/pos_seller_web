export interface CreditUnionOption {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
}

export interface CreditUnionAccount {
  accountNumber: string;
  accountName: string;
  type: 'savings' | 'chequing' | 'shares' | 'fd';
  balance: number;
  currency: string;
}

export interface PaymentAccount {
  id: string;
  creditUnionId: string;
  creditUnionName: string;
  creditUnionLogo: string;
  creditUnionColor: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  nickname?: string;
  isActive: boolean;
  addedAt: string;
}

export interface CreditUnionWithAccounts extends CreditUnionOption {
  accounts: CreditUnionAccount[];
}
