export interface Bank {
  id: number;
  name: string;
  code: string;
  color: string;
  logo: string;
  accentColor: string;
  desc: string;
  category?: 'credit-union' | 'bank' | 'card';
}