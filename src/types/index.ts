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

export type Transaction = {
  id: string;
  userId: string;
  categoryId: string;
  subCategoryId: string;
  amount: number;
  advancePaid: number;
  remainingAmount: number;
  type: TransactionType;
  modeOfPayment: modeOfPayment;
  note: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

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
