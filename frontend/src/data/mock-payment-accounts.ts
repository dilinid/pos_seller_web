import type { CreditUnionWithAccounts } from '../types/payment-account.type';

export const MOCK_CREDIT_UNIONS: CreditUnionWithAccounts[] = [
  {
    id: 'cu-1',
    name: 'Coastal Credit Union',
    logo: '🏖️',
    color: '#0ea5e9',
    description: 'Reliable banking with competitive savings rates and low fees.',
    accounts: [
      {
        accountNumber: '100045623456',
        accountName: 'Primary Savings',
        type: 'savings',
        balance: 12430.00,
        currency: 'LKR',
      },
      {
        accountNumber: '100045678901',
        accountName: 'Everyday Chequing',
        type: 'chequing',
        balance: 3210.50,
        currency: 'LKR',
      },
    ],
  },
  {
    id: 'cu-2',
    name: 'Heritage Community Bank',
    logo: '🏛️',
    color: '#8b5cf6',
    description: 'Trusted community banking serving members for over 50 years.',
    accounts: [
      {
        accountNumber: '200078904561',
        accountName: 'Premium Savings',
        type: 'savings',
        balance: 8750.00,
        currency: 'LKR',
      },
      {
        accountNumber: '200078902345',
        accountName: 'Flexi Chequing',
        type: 'chequing',
        balance: 1950.75,
        currency: 'LKR',
      },
      {
        accountNumber: '200078907890',
        accountName: 'Fixed Deposit',
        type: 'fd',
        balance: 25000.00,
        currency: 'LKR',
      },
    ],
  },
  {
    id: 'cu-3',
    name: 'Summit Financial',
    logo: '⛰️',
    color: '#10b981',
    description: 'Modern banking solutions with high-yield savings and investment options.',
    accounts: [
      {
        accountNumber: '300056781234',
        accountName: 'High-Yield Savings',
        type: 'savings',
        balance: 22100.00,
        currency: 'LKR',
      },
      {
        accountNumber: '300056785678',
        accountName: 'Share Capital',
        type: 'shares',
        balance: 5400.00,
        currency: 'LKR',
      },
    ],
  },
  {
    id: 'cu-4',
    name: 'Valley Trust',
    logo: '🌿',
    color: '#f59e0b',
    description: 'Your local credit union focused on community growth and member prosperity.',
    accounts: [
      {
        accountNumber: '400034561234',
        accountName: 'Savings Plus',
        type: 'savings',
        balance: 4320.00,
        currency: 'LKR',
      },
      {
        accountNumber: '400034565678',
        accountName: 'Student Chequing',
        type: 'chequing',
        balance: 620.00,
        currency: 'LKR',
      },
    ],
  },
];
