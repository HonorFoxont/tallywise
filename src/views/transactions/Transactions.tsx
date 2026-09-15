import { format } from 'date-fns';
import { EllipsisVertical, Filter, Plus, Search } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker/date-range-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FormCombobox from '@/components/ui/form-combobox';
import { Input } from '@/components/ui/input';
import { type Transaction } from '@/types';
import TransactionDialog from '@/views/transactions/components/TransactionDialog';

import useCategories from '../categories/hooks/useCategories';
import useSubcategory from '../sub-categories/hooks/useSubcategory';
import DeleteTransactionsDialog from './components/DeleteTransactionDialog';
import EditTransactionsDialog from './components/EditTransactionDialog';
import filterTransactions from './helper/filterTransaction';
import formatCurrency from './helper/formatCurrency';
import getTransactionTypeColor from './helper/getTransactionTypeColor';
import {
  PAYMENT_MODE_OPTIONS,
  toNamedOptions,
  TRANSACTION_TYPE_OPTIONS,
} from './helper/transactionOptions';
import useTransaction from './hooks/useTransacrtion';

const Transactions: React.FC = () => {
  const { subCategories } = useSubcategory(null);
  const { categories } = useCategories(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter states. `null` means the filter is not applied.
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
  });

  const categoryOptions = useMemo(() => toNamedOptions(categories), [categories]);

  // Fetch transactions
  const { transactions, loading } = useTransaction();

  // Apply filters
  useEffect(() => {
    const filtered = filterTransactions(
      searchTerm,
      typeFilter,
      categoryFilter,
      paymentFilter,
      dateRangeFilter,
      transactions,
      categories,
      subCategories
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

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter(null);
    setCategoryFilter(null);
    setPaymentFilter(null);
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
            <CardTitle className="justify-strech flex">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex w-full gap-2 sm:flex-col md:flex-row">
              <div className="flex w-3/5 justify-evenly gap-2">
                <div className="relative flex-shrink-0">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <FormCombobox
                  options={TRANSACTION_TYPE_OPTIONS}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="All Types"
                  clearable
                  className="w-1/3 flex-shrink-0"
                />

                <FormCombobox
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="All Categories"
                  emptyMessage="No categories found."
                  clearable
                  className="w-1/3 flex-shrink-0"
                />
              </div>
              <div className="flex w-2/5 gap-2">
                <FormCombobox
                  options={PAYMENT_MODE_OPTIONS}
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  placeholder="All Payments"
                  clearable
                  className="w-1/2 flex-shrink-0"
                />
                <div className="w-1/2 flex-shrink-0">
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
              </div>
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
          className="fixed right-4 bottom-4 h-14 w-14 cursor-pointer rounded-full shadow-lg"
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
