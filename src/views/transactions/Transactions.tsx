import { format } from 'date-fns';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { EllipsisVertical, Filter, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import TransactionDialog from '@/views/transactions/components/TransactionDialog';

import { DateRangePicker } from '../../components/ui/date-range-picker/date-range-picker';
import DeleteTransactionsDialog from './components/DeleteTransactionDialog';
import EditTransactionsDialog from './components/EditTransactionDialog';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'savings';
}

interface SubCategory {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  subCategoryId: string | null;
  amount: number;
  type: 'income' | 'expense' | 'savings';
  note: string;
  modeOfPayment: string;
  date: Date;
  advancePaid: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: new Date(),
    end: new Date(),
  });

  // Fetch categories
  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(collection(db, `organizations/${user.organizationId}/categories`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoriesData);
    });
    return () => unsubscribe();
  }, [user?.organizationId]);

  // Fetch subcategories
  useEffect(() => {
    if (!user?.organizationId || categoryFilter === 'all') {
      setSubCategories([]);
      return;
    }
    const q = query(
      collection(
        db,
        `organizations/${user.organizationId}/categories/${categoryFilter}/subCategories`
      )
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subCategoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubCategory[];
      setSubCategories(subCategoriesData);
    });
    return () => unsubscribe();
  }, [user?.organizationId, categoryFilter]);

  // Fetch transactions
  useEffect(() => {
    if (!user?.organizationId) return;
    const transactionsQuery = query(
      collection(db, `organizations/${user.organizationId}/transactions`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Transaction[];
      setTransactions(transactionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.organizationId]);

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter((t) => {
        const categoryName = categories.find((c) => c.id === t.categoryId)?.name || '';
        const subCategoryName = subCategories.find((s) => s.id === t.subCategoryId)?.name || '';
        return (
          t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
          categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subCategoryName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((t) => t.categoryId === categoryFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((t) => t.modeOfPayment === paymentFilter);
    }
    filtered = filtered.filter(
      (t) => t.createdAt > dateRangeFilter.start && t.createdAt < dateRangeFilter.end
    );
    setFilteredTransactions(filtered);
  }, [
    transactions,
    categories,
    subCategories,
    searchTerm,
    typeFilter,
    categoryFilter,
    paymentFilter,
    dateRangeFilter,
  ]);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'savings':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('NPR', 'Rs ');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your business transactions</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="fonepay">Fonepay</SelectItem>
                  <SelectItem value="esewa">Esewa</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
              <DateRangePicker
                onUpdate={(values) =>
                  setDateRangeFilter({
                    start: values.range.from,
                    end: values.range.to!,
                  })
                }
                initialDateFrom={dateRangeFilter.start}
                initialDateTo={dateRangeFilter.end}
                align="start"
                locale="en-GB"
                showCompare={false}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="py-8 text-center text-gray-500">
                  {transactions.length === 0
                    ? 'No transactions yet'
                    : 'No transactions match your filters'}
                </p>
              ) : (
                filteredTransactions.map((transaction) => {
                  const categoryName =
                    categories.find((c) => c.id === transaction.categoryId)?.name || 'Unknown';
                  const subCategoryName =
                    subCategories.find((s) => s.id === transaction.subCategoryId)?.name || 'None';
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge className={getTransactionTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {categoryName} • {subCategoryName}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {transaction.modeOfPayment}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="cursor-pointer">
                              <EllipsisVertical className="w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setEditDialogOpen(true);
                                }}
                              >
                                edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="mb-1 text-gray-600">{transaction.note || 'No note'}</p>
                        <p className="text-xs text-gray-400">
                          {format(transaction.date, 'MMM dd, yyyy')} • Created{' '}
                          {format(transaction.createdAt, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
                        {transaction.advancePaid > 0 && (
                          <div className="text-sm text-gray-500">
                            <p>Advance: {formatCurrency(transaction.advancePaid)}</p>
                            <p>Remaining: {formatCurrency(transaction.remainingAmount)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        <Button
          size="lg"
          className="absolute right-4 bottom-4 h-14 w-14 cursor-pointer rounded-full shadow-lg"
          onClick={() => {
            setTransactionDialogOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <TransactionDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
      <EditTransactionsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        transaction={selectedTransaction}
      />
      <DeleteTransactionsDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default Transactions;
