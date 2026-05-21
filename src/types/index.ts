export * from './users';

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
  Savings = 'savings',
}

export enum modeOfPayment {
  Cash = 'cash',
  Fonepay = 'fonepay',
  Esewa = 'esewa',
  Credit = 'credit',
}

export interface Organization {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  createdBy: string;
  date: Date;
  transactionType: TransactionType;
  category: string;
  subCategory: string;
  note: string;
  amountTotal: number;
  advancePaid: number;
  remainingAmount: number;
  modeOfPayment: modeOfPayment;
  organizationId: string;
  editHistory: EditHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EditHistory {
  editedBy: string;
  timestamp: Date;
  before: Partial<Transaction>;
  after: Partial<Transaction>;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
