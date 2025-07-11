import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
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

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>('none');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState<string>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]!);
  const [advancePaid, setAdvancePaid] = useState('');
  const [loading, setLoading] = useState(false);

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
      setSelectedCategory(fetchedCategories[0]?.id || undefined);
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
      setSelectedSubCategory(fetchedSubCategories[0]?.id || 'none');
    });
    return () => unsubscribe();
  }, [user?.organizationId, selectedCategory]);

  const handleSave = async () => {
    if (!user?.organizationId || !selectedCategory || !amount || !date) {
      toast.error('Invalid input or user');
      return;
    }
    setLoading(true);
    try {
      const amountNum = parseFloat(amount);
      const advancePaidNum = type === 'income' && advancePaid ? parseFloat(advancePaid) : 0;
      await addDoc(collection(db, `organizations/${user.organizationId}/transactions`), {
        userId: user.id,
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory === 'none' ? null : selectedSubCategory,
        amount: amountNum,
        type,
        note: note || '',
        modeOfPayment: type === 'income' ? modeOfPayment || 'cash' : 'cash',
        date: new Date(date),
        advancePaid: advancePaidNum,
        remainingAmount: amountNum - advancePaidNum,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Transaction added successfully');
      setAmount('');
      setNote('');
      setModeOfPayment('cash');
      setDate(new Date().toISOString().split('T')[0]!);
      setAdvancePaid('');
      setSelectedCategory(undefined);
      setSelectedSubCategory('none');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Create a new transaction.</DialogDescription>
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
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
