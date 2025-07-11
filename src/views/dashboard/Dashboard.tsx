import { PiggyBank, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import TransactionDialog from '@/views/transactions/components/TransactionDialog';

import { useAuth } from '../../contexts/AuthContext';
import LineChart from './components/LineChart';
import PieChart from './components/PieChart';
import StatsCard from './components/StatsCard';

const recentTransactions = [
  {
    id: '1',
    type: 'income',
    category: 'Salary',
    subCategory: 'Monthly',
    amount: 5000,
    modeOfPayment: 'fonepay',
    date: new Date('2025-07-01'),
  },
  {
    id: '2',
    type: 'expense',
    category: 'Events',
    subCategory: null,
    amount: 2000,
    modeOfPayment: 'cash',
    date: new Date('2025-06-30'),
  },
  {
    id: '3',
    type: 'savings',
    category: 'Savings',
    subCategory: 'Fixed Deposit',
    amount: 1000,
    modeOfPayment: 'cash',
    date: new Date('2025-06-29'),
  },
  {
    id: '4',
    type: 'income',
    category: 'Glasshouse',
    subCategory: null,
    amount: 3000,
    modeOfPayment: 'esewa',
    date: new Date('2025-06-28'),
  },
  {
    id: '5',
    type: 'expense',
    category: 'Events',
    subCategory: 'Catering',
    amount: 1500,
    modeOfPayment: 'cash',
    date: new Date('2025-06-27'),
  },
];

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

const Dashboard = () => {
  const { user } = useAuth();
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
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('NPR', 'Rs ');
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>
      <div>
        <Select>
          <SelectTrigger className="ml-auto w-40">
            <SelectValue placeholder="Daily" defaultValue="daily" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Income"
          value={20000}
          change="+12% from last month"
          icon={<TrendingUp className="h-4 w-4 text-white" />}
          trend="up"
          color="bg-green-500"
        />
        <StatsCard
          title="Total Expenses"
          value={2000}
          change="+8% from last month"
          icon={<TrendingDown className="h-4 w-4 text-white" />}
          trend="up"
          color="bg-red-500"
        />
        <StatsCard
          title="Total Savings"
          value={10000}
          change="+15% from last month"
          icon={<PiggyBank className="h-4 w-4 text-white" />}
          trend="up"
          color="bg-blue-500"
        />
      </div>
      <div className="flex justify-between">
        <Card className="w-[50%]">
          <CardHeader>
            <CardTitle>Transaction Pattern With Respect to Type</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>
        <Card className="w-[49%]">
          <CardHeader>
            <CardTitle>Overall Income According to Category</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart />
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
                  <TableCell>{transaction.subCategory || 'None'}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <Badge className={getModeOfPaymentColor(transaction.modeOfPayment)}>
                      {transaction.modeOfPayment.charAt(0).toUpperCase() +
                        transaction.modeOfPayment.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{(transaction.date, 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed right-8 bottom-8 h-14 w-14 cursor-pointer rounded-full shadow-lg"
        onClick={() => setTransactionDialogOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <TransactionDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />
    </div>
  );
};
export default Dashboard;
