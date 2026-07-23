import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Bank {
  id: string;
  name: string;
  code: string;
  color: string;
  logo: string;
  accentColor: string;
  desc: string;
  category?: 'credit-union' | 'bank' | 'card';
}

export interface SavingAccount {
  accNo: string;
  type: string;
  balance: number;
  currency: string;
  interestRate: number;
}

export interface LoanAccount {
  loanNo: string;
  name: string;
  balance: number;
  capital: number;
  installment: number;
  fee: number;
  pastDue: number;
  pastDueDays: number;
  totalArrears: number;
  interest: number;
  status: number;
}

export interface FixedDeposit {
  fdNo: string;
  name: string;
  balance: number;
  interestRate: number;
  openDate: string;
  renewDate: string;
}

export interface SharePortfolio {
  shareNo: string;
  name: string;
  balance: number;
}

interface BankData {
  savings: SavingAccount[];
  loans: LoanAccount[];
  fds: FixedDeposit[];
  shares: SharePortfolio[];
}

interface BankContextType {
  banks: Bank[];
  selectedBank: Bank | null;
  selectBank: (bankId: string) => void;
  portfolio: BankData | null;
  loading: boolean;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const AVAILABLE_BANKS: Bank[] = [
  {
    id: 'aib',
    name: 'AIB Bank Group',
    code: 'AIB',
    color: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
    accentColor: '#4f46e5',
    logo: '🏦',
    desc: 'Apex International Banking - Premier retail & commercial solutions.',
    category: 'bank'
  },
  {
    id: 'apex',
    name: 'Apex Finance Corp',
    code: 'APEX',
    color: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    accentColor: '#0ea5e9',
    logo: '💎',
    desc: 'High-yield investment portfolios and wealth management services.',
    category: 'bank'
  },
  {
    id: 'horizon',
    name: 'Horizon Trust Bank',
    code: 'HTB',
    color: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
    accentColor: '#10b981',
    logo: '⛰️',
    desc: 'Secure agricultural, housing, and structural personal financing.',
    category: 'bank'
  },
  {
    id: 'union',
    name: 'Union Cooperative Bank',
    code: 'UCB',
    color: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
    accentColor: '#f59e0b',
    logo: '🤝',
    desc: 'Community-first banking with low-rate loans and strong member dividends.',
    category: 'credit-union'
  },
  {
    id: 'visa',
    name: 'AIB Premium Visa',
    code: 'VISA',
    color: 'linear-gradient(135deg, #e11d48 0%, #4c0519 100%)',
    accentColor: '#e11d48',
    logo: '💳',
    desc: 'Unified debit/credit card access with cashbacks and transaction logging.',
    category: 'card'
  }
];

const MOCK_PORTFOLIOS: Record<string, BankData> = {
  aib: {
    savings: [
      { accNo: 'SA-102901-AIB', type: 'Premium Savings', balance: 45280.50, currency: 'USD', interestRate: 3.25 },
      { accNo: 'SA-559381-AIB', type: 'Active Checking', balance: 8490.20, currency: 'USD', interestRate: 0.15 }
    ],
    loans: [
      { loanNo: 'LN-772901-AIB', name: 'Residential Mortgage', balance: 250000, capital: 184500, installment: 1450, fee: 4.5, nextDueDate: 'June 01, 2026' }
    ],
    fds: [
      { fdNo: 'FD-992018-AIB', name: 15000, balance: 16800, interestRate: 6.0, openDate: 'December 18, 2027', renewDate: 24 }
    ],
    shares: [
      { shareNo: 'AIBG', name: 'AIB Bank Group Inc', shares: 500, averageCost: 12.50, currentPrice: 15.80, balance: 7900, changePercent: 26.4 }
    ]
  },
  apex: {
    savings: [
      { accNo: 'SA-882019-APX', type: 'High Yield Savings', balance: 125900.00, currency: 'USD', interestRate: 4.85 }
    ],
    loans: [],
    fds: [
      { fdNo: 'FD-409182-APX', name: 50000, balance: 56250, interestRate: 6.25, openDate: 'October 10, 2026', renewDate: 24 },
      { fdNo: 'FD-302912-APX', name: 20000, balance: 21100, interestRate: 5.50, openDate: 'November 05, 2026', renewDate: 12 }
    ],
    shares: [
      { shareNo: 'APXW', name: 'Apex Wealth Growth Fund', shares: 1200, averageCost: 45.20, currentPrice: 48.90, balance: 58680, changePercent: 8.18 }
    ]
  },
  horizon: {
    savings: [
      { accNo: 'SA-442890-HTB', type: 'Standard Savings', balance: 18450.00, currency: 'USD', interestRate: 2.10 }
    ],
    loans: [
      { loanNo: 'LN-291829-HTB', name: 'Agricultural Support Loan', balance: 40000, capital: 12800, installment: 550, fee: 3.75, nextDueDate: 'June 10, 2026' }
    ],
    fds: [],
    shares: [
      { shareNo: 'HTBC', name: 'Horizon Trust BioCorp', shares: 350, averageCost: 22.00, currentPrice: 19.50, balance: 6825, changePercent: -11.3 }
    ]
  },
  union: {
    savings: [
      { accNo: 'SA-339281-UCB', type: 'Coop Share Capital Account', balance: 12000.00, currency: 'USD', interestRate: 4.0 },
      { accNo: 'SA-119283-UCB', type: 'Coop Member Savings', balance: 6450.75, currency: 'USD', interestRate: 3.50 }
    ],
    loans: [
      { loanNo: 'LN-552019-UCB', name: 'Personal Vehicle Loan', balance: 25000, capital: 9400, installment: 410, fee: 4.9, nextDueDate: 'June 05, 2026' }
    ],
    fds: [
      { fdNo: 'FD-771092-UCB', name: 10000, balance: 11150, interestRate: 5.75, openDate: 'August 12, 2026', renewDate: 24 }
    ],
    shares: [
      { shareNo: 'UCBS', name: 'Union Coop Shares', shares: 2000, averageCost: 5.00, currentPrice: 5.75, balance: 11500, changePercent: 15.0 }
    ]
  }
};

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [portfolio, setPortfolio] = useState<BankData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('selected_bank');
    if (saved) {
      const bank = JSON.parse(saved);
      setSelectedBank(bank);
      setPortfolio(MOCK_PORTFOLIOS[bank.id] || null);
    }
  }, []);

  const selectBank = (bankId: string) => {
    setLoading(true);
    setTimeout(() => {
      const bank = AVAILABLE_BANKS.find(b => b.id === bankId) || null;
      setSelectedBank(bank);
      if (bank) {
        localStorage.setItem('selected_bank', JSON.stringify(bank));
        setPortfolio(MOCK_PORTFOLIOS[bank.id] || null);
      } else {
        localStorage.removeItem('selected_bank');
        setPortfolio(null);
      }
      setLoading(false);
    }, 600); // Premium delay simulation
  };

  return (
    <BankContext.Provider value={{ banks: AVAILABLE_BANKS, selectedBank, selectBank, portfolio, loading }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
