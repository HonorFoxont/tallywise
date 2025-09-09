export * from './users';

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
  transactionType: 'income' | 'expense' | 'savings';
  category: string;
  subCategory: string;
  note: string;
  amountTotal: number;
  advancePaid: number;
  remainingAmount: number;
  modeOfPayment: 'cash' | 'fonepay' | 'esewa' | 'credit';
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
  organizationId: string;
  createdAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  organizationId: string;
  createdAt: Date;
}
