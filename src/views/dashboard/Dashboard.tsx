import { format } from 'date-fns';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Pencil, PiggyBank, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import DeleteTransactionDialog from '@/views/transactions/components/DeleteTransactionDialog';
import EditTransactionDialog from '@/views/transactions/components/EditTransactionDialog';
import TransactionDialog from '@/views/transactions/components/TransactionDialog';
import { Button } from '~/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/src/components/ui/card';
import { DateRangePicker } from '~/src/components/ui/date-range-picker/date-range-picker';

import LineChart from './components/LineChart';
import PieChart from './components/PieChart';
import StatsCard from './components/StatsCard';

interface Transaction {
  id: string;
  categoryId: string;
  subCategoryId: string | null;
  amount: number;
  type: 'income' | 'expense' | 'savings';
  modeOfPayment: string;
  date: Date;
  note: string;
  advancePaid: number;
  remainingAmount: number;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'savings';
}

interface SubCategory {
  id: string;
  name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editTransactionDialogOpen, setEditTransactionDialogOpen] = useState(false);
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, SubCategory[]>>({});
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'savings' | 'all'>('all');
  const [pieChartType, setPieChartType] = useState<'income' | 'expense' | 'savings'>('income');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
    end: new Date(),
  });

  // Check if user is admin or superadmin
  const isAdminOrSuperadmin = ['superadmin', 'admin'].includes(user?.role || '');

  // Chart configuration
  const chartConfig = {
    income: { label: 'Income', color: 'hsl(160, 81%, 43%)' }, // #10B981
    expense: { label: 'Expense', color: 'hsl(0, 77%, 60%)' }, // #EF4444
    savings: { label: 'Savings', color: 'hsl(221, 83%, 53%)' }, // #3B82F6
    salary: { label: 'Salary', color: 'hsl(160, 81%, 43%)' },
    savingsCategory: { label: 'Savings', color: 'hsl(221, 83%, 53%)' },
    events: { label: 'Events', color: 'hsl(41, 88%, 59%)' }, // #F59E0B
    glasshouse: { label: 'Glasshouse', color: 'hsl(0, 77%, 60%)' },
  };

  // Fetch categories
  useEffect(() => {
    if (!user || !user.organizationId) {
      toast.error('User or organization ID not found');
      return;
    }
    const q = query(collection(db, `organizations/${user.organizationId}/categories`));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCategories);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Fetch subcategories
  useEffect(() => {
    if (!user || !user.organizationId || !categories.length) return;
    const unsubscribes: (() => void)[] = [];
    categories.forEach((category) => {
      const q = query(
        collection(
          db,
          `organizations/${user.organizationId}/categories/${category.id}/subCategories`
        )
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedSubCategories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SubCategory[];
          setSubCategories((prev) => ({
            ...prev,
            [category.id]: fetchedSubCategories,
          }));
        },
        (error) => {
          console.error(`Error fetching subcategories for ${category.id}:`, error);
          toast.error(`Failed to load subcategories for ${category.name}`);
        }
      );
      unsubscribes.push(unsubscribe);
    });
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, categories]);

  // Fetch transactions with date range filter
  useEffect(() => {
    if (!user || !user.organizationId) {
      toast.error('User or organization ID not found');
      return;
    }
    const q = query(
      collection(db, `organizations/${user.organizationId}/transactions`),
      orderBy('date', 'desc'),
      where('date', '>=', dateRangeFilter.start),
      where('date', '<=', dateRangeFilter.end),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          note: doc.data().note || '',
          advancePaid: doc.data().advancePaid || 0,
          remainingAmount: doc.data().remainingAmount || 0,
        })) as Transaction[];
        setTransactions(fetchedTransactions);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      }
    );
    return () => unsubscribe();
  }, [user, dateRangeFilter]);

  // Filter transactions by type for table and line chart
  const filteredTransactions = useMemo(() => {
    return selectedType === 'all'
      ? transactions
      : transactions.filter((t) => t.type === selectedType);
  }, [transactions, selectedType]);

  // Recent transactions (latest 5)
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, 5).map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId)?.name || 'Unknown',
      subCategory: t.subCategoryId
        ? subCategories[t.categoryId]?.find((sc) => sc.id === t.subCategoryId)?.name || 'Unknown'
        : 'None',
    }));
  }, [filteredTransactions, categories, subCategories]);

  // Stats Card Data
  const statsData = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = filteredTransactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, totalSavings };
  }, [filteredTransactions]);

  // Line Chart Data
  const lineChartData = useMemo(() => {
    const daysDiff = Math.ceil(
      (dateRangeFilter.end.getTime() - dateRangeFilter.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const step = Math.max(1, Math.floor(daysDiff / 5));
    const labels = Array.from({ length: Math.min(5, daysDiff) }, (_, i) =>
      format(new Date(dateRangeFilter.start.getTime() + i * step * 24 * 60 * 60 * 1000), 'MMM dd')
    );
    const incomeData = Array(labels.length).fill(0);
    const expenseData = Array(labels.length).fill(0);
    const savingsData = Array(labels.length).fill(0);

    filteredTransactions.forEach((t) => {
      const diff = Math.floor(
        (t.date.getTime() - dateRangeFilter.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const index = Math.floor(diff / step);
      if (index >= 0 && index < labels.length) {
        if (t.type === 'income') incomeData[index] += t.amount;
        if (t.type === 'expense') expenseData[index] += t.amount;
        if (t.type === 'savings') savingsData[index] += t.amount;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
        },
        {
          label: 'Savings',
          data: savingsData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ].filter((dataset) => selectedType === 'all' || dataset.label.toLowerCase() === selectedType),
    };
  }, [filteredTransactions, dateRangeFilter]);

  // Pie Chart Data
  const pieChartData = useMemo(() => {
    const filteredCategories = categories.filter((category) => category.type === pieChartType);
    const categoryMap = filteredCategories.reduce(
      (acc, category) => {
        acc[category.id] = {
          name: category.name,
          value: 0,
          fill: chartConfig[category.name.toLowerCase()]?.color || 'hsl(0, 0%, 50%)',
        };
        return acc;
      },
      {} as Record<string, { name: string; value: number; fill: string }>
    );

    filteredTransactions
      .filter((t) => t.type === pieChartType)
      .forEach((t) => {
        if (categoryMap[t.categoryId]) {
          categoryMap[t.categoryId]!.value += t.amount;
        }
      });

    return Object.values(categoryMap).filter((cat) => cat.value > 0);
  }, [filteredTransactions, categories, pieChartType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('NPR', 'Rs ');
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'expense':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'savings':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getModeOfPaymentColor = (mode: string) => {
    switch (mode) {
      case 'cash':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'fonepay':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'esewa':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'credit':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'User'}</p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between gap-4">
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setSelectedType(value as 'income' | 'expense' | 'savings' | 'all')
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker
            onUpdate={(values) =>
              setDateRangeFilter({
                start: values.range.from,
                end: values.range.to || new Date(),
              })
            }
            initialDateFrom={dateRangeFilter.start}
            initialDateTo={dateRangeFilter.end}
            align="start"
            locale="en-GB"
            showCompare={false}
          />
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Income"
            value={statsData.totalIncome}
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            trend="up"
            color="bg-green-500"
          />
          <StatsCard
            title="Total Expenses"
            value={statsData.totalExpense}
            icon={<TrendingDown className="h-4 w-4 text-white" />}
            trend="up"
            color="bg-red-500"
          />
          <StatsCard
            title="Total Savings"
            value={statsData.totalSavings}
            icon={<PiggyBank className="h-4 w-4 text-white" />}
            trend="up"
            color="bg-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Pattern With Respect to Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <LineChart data={lineChartData} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Overall Income According to Category</CardTitle>
                <Select
                  value={pieChartType}
                  onValueChange={(value) =>
                    setPieChartType(value as 'income' | 'expense' | 'savings')
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <PieChart data={pieChartData} />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SubCategory</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode of Payment</TableHead>
                  <TableHead>Date</TableHead>
                  {isAdminOrSuperadmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.subCategory}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getModeOfPaymentColor(transaction.modeOfPayment)}>
                        {transaction.modeOfPayment.charAt(0).toUpperCase() +
                          transaction.modeOfPayment.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(transaction.date, 'MMM dd, yyyy')}</TableCell>
                    {isAdminOrSuperadmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setEditTransactionDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setDeleteTransactionDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isAdminOrSuperadmin && (
          <>
            <Button
              size="lg"
              className="fixed right-8 bottom-8 h-14 w-14 cursor-pointer rounded-full shadow-lg"
              onClick={() => setTransactionDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <TransactionDialog
              open={transactionDialogOpen}
              onOpenChange={setTransactionDialogOpen}
            />
            <EditTransactionDialog
              open={editTransactionDialogOpen}
              onOpenChange={setEditTransactionDialogOpen}
              transaction={selectedTransaction}
            />
            <DeleteTransactionDialog
              open={deleteTransactionDialogOpen}
              onOpenChange={setDeleteTransactionDialogOpen}
              transaction={selectedTransaction}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
