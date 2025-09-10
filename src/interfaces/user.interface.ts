export interface User {
  id: string;
  type: 'regular' | 'premium' | 'vip';
  age: number;
  isFirstTimeBuyer: boolean;
  country: string;
  verificationLevel: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  amount: number;
  category: 'electronics' | 'healthcare' | 'clothing' | 'books' | 'food';
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Transaction {
  id: string;
  amount: number;
  country: string;
  deviceId: string;
  isNewDevice: boolean;
  createdAt: Date;
}

export interface UserTransactionStats {
  countToday: number;
  totalToday: number;
  lastTransactionDate: Date;
}
