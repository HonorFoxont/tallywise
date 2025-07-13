import { format } from 'date-fns';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

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
  categoryId: string;
  subCategoryId: string | null;
  amount: number;
  type: 'income' | 'expense' | 'savings';
  note: string;
  modeOfPayment: string;
  date: Date;
  advancePaid: number;
  remainingAmount: number;
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const EditTransactionDialog: React.FC<EditTransactionDialogProps> = ({
  open,
  onOpenChange,
  transaction,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>('none');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('cash');
  const [date, setDate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setSelectedCategory(transaction.categoryId);
      setSelectedSubCategory(transaction.subCategoryId || 'none');
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      setModeOfPayment(transaction.modeOfPayment || 'cash');
      setDate(transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : '');
      setAdvancePaid(transaction.advancePaid ? transaction.advancePaid.toString() : '');
    }
  }, [transaction]);

  // Fetch categories
  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, `organizations/${user.organizationId}/categories`),
      where('type', '==', type)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(fetchedCategories);
      if (!selectedCategory || !fetchedCategories.some((cat) => cat.id === selectedCategory)) {
        setSelectedCategory(fetchedCategories[0]?.id || undefined);
      }
    });
    return () => unsubscribe();
  }, [user?.organizationId, type]);

  // Fetch subcategories
  useEffect(() => {
    if (!user?.organizationId || !selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory('none');
      return;
    }
    const q = query(
      collection(
        db,
        `organizations/${user.organizationId}/categories/${selectedCategory}/subCategories`
      )
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSubCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubCategory[];
      setSubCategories(fetchedSubCategories);
      if (
        !selectedSubCategory ||
        !fetchedSubCategories.some((sub) => sub.id === selectedSubCategory)
      ) {
        setSelectedSubCategory(fetchedSubCategories[0]?.id || 'none');
      }
    });
    return () => unsubscribe();
  }, [user?.organizationId, selectedCategory]);

  const handleSave = async () => {
    if (!user?.organizationId || !selectedCategory || !amount || !date || !transaction) {
      toast.error('Invalid input or transaction');
      return;
    }
    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      const advancePaidNum = type === 'income' && advancePaid ? parseFloat(advancePaid) : 0;
      await updateDoc(
        doc(db, `organizations/${user.organizationId}/transactions/${transaction.id}`),
        {
          categoryId: selectedCategory,
          subCategoryId: selectedSubCategory === 'none' ? null : selectedSubCategory,
          amount: amountNum,
          type,
          note: note || '',
          modeOfPayment: type === 'income' ? modeOfPayment || 'cash' : 'cash',
          date: new Date(date),
          advancePaid: advancePaidNum,
          remainingAmount: amountNum - advancePaidNum,
          updatedAt: new Date(),
        }
      );
      toast.success('Transaction updated successfully');
      setAmount('');
      setNote('');
      setModeOfPayment('cash');
      setDate('');
      setAdvancePaid('');
      setSelectedCategory(undefined);
      setSelectedSubCategory('none');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update an existing transaction.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as 'income' | 'expense' | 'savings')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subCategory">SubCategory</Label>
            <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {subCategories.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note"
              disabled={loading}
            />
          </div>
          {type === 'income' && (
            <>
              <div>
                <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                <Select value={modeOfPayment} onValueChange={setModeOfPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="fonepay">Fonepay</SelectItem>
                    <SelectItem value="esewa">Esewa</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="advancePaid">Advance Paid</Label>
                <Input
                  id="advancePaid"
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  placeholder="Enter advance paid"
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!amount || !selectedCategory || !date || loading}
            >
              {loading ? 'Updating...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
