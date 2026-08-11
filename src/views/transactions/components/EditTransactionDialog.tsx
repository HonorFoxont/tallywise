import { format } from 'date-fns';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormCombobox from '@/components/ui/form-combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

import {
  PAYMENT_MODE_OPTIONS,
  toNamedOptions,
  TRANSACTION_TYPE_OPTIONS,
} from '../helper/transactionOptions';

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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('cash');
  const [date, setDate] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = useMemo(() => toNamedOptions(categories), [categories]);
  const subCategoryOptions = useMemo(() => toNamedOptions(subCategories), [subCategories]);

  // Initialize form with transaction data
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setSelectedCategory(transaction.categoryId);
      setSelectedSubCategory(transaction.subCategoryId);
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
      setSelectedCategory((current) =>
        current && fetchedCategories.some((cat) => cat.id === current)
          ? current
          : (fetchedCategories[0]?.id ?? null)
      );
    });
    return () => unsubscribe();
  }, [user?.organizationId, type]);

  // Fetch subcategories
  useEffect(() => {
    if (!user?.organizationId || !selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory(null);
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
      setSelectedSubCategory((current) =>
        current && fetchedSubCategories.some((sub) => sub.id === current)
          ? current
          : (fetchedSubCategories[0]?.id ?? null)
      );
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
          subCategoryId: selectedSubCategory,
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
      setSelectedCategory(null);
      setSelectedSubCategory(null);
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
      <DialogContent ref={contentRef}>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Update an existing transaction.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <FormCombobox
              id="type"
              options={TRANSACTION_TYPE_OPTIONS}
              value={type}
              onChange={(value) => setType((value ?? 'income') as typeof type)}
              placeholder="Select type"
              disabled={loading}
              portalContainer={contentRef}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <FormCombobox
              id="category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Select category"
              emptyMessage="No categories found."
              disabled={loading}
              clearable
              portalContainer={contentRef}
            />
          </div>
          <div>
            <Label htmlFor="subCategory">SubCategory</Label>
            <FormCombobox
              id="subCategory"
              options={subCategoryOptions}
              value={selectedSubCategory}
              onChange={setSelectedSubCategory}
              placeholder="Select subcategory"
              emptyMessage="No subcategories found."
              disabled={loading || !selectedCategory}
              clearable
              portalContainer={contentRef}
            />
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
                <FormCombobox
                  id="modeOfPayment"
                  options={PAYMENT_MODE_OPTIONS}
                  value={modeOfPayment}
                  onChange={(value) => setModeOfPayment(value ?? 'cash')}
                  placeholder="Select payment mode"
                  disabled={loading}
                  portalContainer={contentRef}
                />
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
