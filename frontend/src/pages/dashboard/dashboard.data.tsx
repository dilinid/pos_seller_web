import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Globe } from 'lucide-react';
import type {
  DashboardContactInfo,
  DashboardGuaranteedLoan,
  DashboardMessageItem,
} from './dashboard.types';

export const dashboardContacts: Record<string, DashboardContactInfo> = {
  aib: {
    address: 'No. 18, Union Place, Colombo 02, Sri Lanka',
    hotline: '+94 11 234 5678',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/', icon: <FaFacebook size={14} /> },
      { label: 'YouTube', href: 'https://www.youtube.com/', icon: <FaYoutube size={14} /> },
      { label: 'Instagram', href: 'https://www.instagram.com/', icon: <FaInstagram size={14} /> },
      { label: 'Web', href: '#', icon: <Globe size={14} /> },
    ],
  },
  apex: {
    address: '45, Galle Road, Colombo 03, Sri Lanka',
    hotline: '+94 11 245 7788',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/', icon: <FaFacebook size={14} /> },
      { label: 'YouTube', href: 'https://www.youtube.com/', icon: <FaYoutube size={14} /> },
      { label: 'Instagram', href: 'https://www.instagram.com/', icon: <FaInstagram size={14} /> },
      { label: 'Web', href: '#', icon: <Globe size={14} /> },
    ],
  },
  horizon: {
    address: '12, Nawam Mawatha, Colombo 02, Sri Lanka',
    hotline: '+94 11 289 4411',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/', icon: <FaFacebook size={14} /> },
      { label: 'YouTube', href: 'https://www.youtube.com/', icon: <FaYoutube size={14} /> },
      { label: 'Instagram', href: 'https://www.instagram.com/', icon: <FaInstagram size={14} /> },
      { label: 'Web', href: '#', icon: <Globe size={14} /> },
    ],
  },
  union: {
    address: '88, Kandy Road, Kurunegala, Sri Lanka',
    hotline: '+94 37 222 9911',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/', icon: <FaFacebook size={14} /> },
      { label: 'YouTube', href: 'https://www.youtube.com/', icon: <FaYoutube size={14} /> },
      { label: 'Instagram', href: 'https://www.instagram.com/', icon: <FaInstagram size={14} /> },
      { label: 'Web', href: '#', icon: <Globe size={14} /> },
    ],
  },
  visa: {
    address: "210, St. Anthony's Mawatha, Colombo 04, Sri Lanka",
    hotline: '+94 11 267 3200',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/', icon: <FaFacebook size={14} /> },
      { label: 'YouTube', href: 'https://www.youtube.com/', icon: <FaYoutube size={14} /> },
      { label: 'Instagram', href: 'https://www.instagram.com/', icon: <FaInstagram size={14} /> },
      { label: 'Web', href: '#', icon: <Globe size={14} /> },
    ],
  },
};

export const dashboardMessages: DashboardMessageItem[] = [
  {
    title: 'Monthly statement is ready',
    time: 'Today, 08:15 AM',
    body: 'Your latest account statement is available in the secure portal.',
  },
  {
    title: 'Card payment received',
    time: 'Yesterday, 04:30 PM',
    body: 'Your latest card payment was posted successfully.',
  },
  {
    title: 'Loan reminder',
    time: '2 days ago',
    body: 'A scheduled repayment is coming up in the next 3 days.',
  },
];

export const dashboardAlerts: DashboardMessageItem[] = [
  {
    title: 'Security alert',
    time: 'Today, 09:20 AM',
    body: 'A new sign-in was detected from a recognized device.',
  },
  {
    title: 'Rate update',
    time: 'Yesterday, 11:00 AM',
    body: 'Savings rates were updated for your linked institution.',
  },
  {
    title: 'Service notice',
    time: '2 days ago',
    body: 'Planned maintenance is scheduled for this weekend.',
  },
];

export const guaranteedLoans: DashboardGuaranteedLoan[] = [
  {
    loanNo: 'GL-204881-AIB',
    borrower: 'Greenfield Foods Cooperative',
    name: 'Business Expansion Loan',
    balance: 26500,
    pastDue: 980,
    interestRate: 5.1,
    nextDueDate: 'June 22, 2026',
  },
  {
    loanNo: 'GL-390144-UCB',
    borrower: 'Member Housing Project',
    name: 'Home Improvement Loan',
    balance: 11800,
    pastDue: 460,
    interestRate: 4.6,
    nextDueDate: 'July 04, 2026',
  },
];
