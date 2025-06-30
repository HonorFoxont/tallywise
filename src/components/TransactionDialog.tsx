import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { type Transaction } from '@/types';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'saving';
  subCategories: { name: string; createdAt: Date }[];
}

const TransactionDialog: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    transactionType: '',
    category: '',
    subCategory: '',
    note: '',
    amountTotal: '',
    advancePaid: '',
    modeOfPayment: '',
  });

  const incomePaymentModes = ['cash', 'fonepay', 'esewa', 'credit'];
  const savingsPaymentModes = ['cash'];
  const expensePaymentModes = ['cash'];

  // Fetch categories based on transaction type
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || authLoading || !formData.transactionType) {
        setCategories([]);
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, category: '', subCategory: '' }));
        return;
      }

      try {
        const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
        const q = query(categoriesRef, where('type', '==', formData.transactionType));
        const querySnapshot = await getDocs(q);
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          subCategories: (doc.data().subCategories || []).map((sub: any) => ({
            ...sub,
            createdAt: sub.createdAt.toDate(),
          })),
        })) as Category[];
        setCategories(fetchedCategories);
        setFormData((prev) => ({ ...prev, category: '', subCategory: '' }));
        setSubCategories([]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, [user?.organizationId, formData.transactionType, authLoading]);

  // Fetch subcategories based on selected category
  useEffect(() => {
    const fetchSubCategories = () => {
      if (!formData.category) {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
        return;
      }

      const selectedCategory = categories.find((cat) => cat.id === formData.category);
      if (selectedCategory) {
        const subCategoryNames = selectedCategory.subCategories.map((sub) => sub.name);
        setSubCategories(subCategoryNames);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    };

    fetchSubCategories();
  }, [formData.category, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) {
      toast.error('No organization assigned to user');
      return;
    }

    setLoading(true);
    try {
      const amountTotal = parseFloat(formData.amountTotal) || 0;
      const advancePaid = parseFloat(formData.advancePaid) || 0;

      const transaction: Omit<Transaction, 'id'> = {
        createdBy: user.id,
        date: new Date(),
        transactionType: formData.transactionType as 'income' | 'expense' | 'savings',
        category: formData.category,
        subCategory: formData.subCategory,
        note: formData.note,
        amountTotal,
        advancePaid,
        remainingAmount: amountTotal - advancePaid,
        modeOfPayment: formData.modeOfPayment as 'cash' | 'fonepay' | 'esewa' | 'credit',
        organizationId: user.organizationId,
        editHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'transactions'), transaction);

      toast.success('Transaction created successfully');

      // Reset form
      setFormData({
        transactionType: '',
        category: '',
        subCategory: '',
        note: '',
        amountTotal: '',
        advancePaid: '',
        modeOfPayment: '',
      });

      setOpen(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="transactionType">Transaction Type *</Label>
                <Select
                  value={formData.transactionType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      transactionType: value,
                      category: '',
                      subCategory: '',
                    })
                  }
                  required
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

              {formData.transactionType && (
                <>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value, subCategory: '' })
                      }
                      required
                      disabled={!formData.transactionType || categories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categories.length === 0 ? 'No categories available' : 'Select category'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subCategory">Sub Category *</Label>
                    <Select
                      value={formData.subCategory}
                      onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                      required
                      disabled={!formData.category || subCategories.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            subCategories.length === 0
                              ? 'No subcategories available'
                              : 'Select sub category'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.map((subCat) => (
                          <SelectItem key={subCat} value={subCat}>
                            {subCat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amountTotal">Total Amount *</Label>
                    <Input
                      id="amountTotal"
                      type="number"
                      step="0.01"
                      value={formData.amountTotal}
                      onChange={(e) => setFormData({ ...formData, amountTotal: e.target.value })}
                      required
                    />
                  </div>

                  {formData.transactionType === 'income' && (
                    <div>
                      <Label htmlFor="advancePaid">Advance Paid</Label>
                      <Input
                        id="advancePaid"
                        type="number"
                        step="0.01"
                        value={formData.advancePaid}
                        onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="modeOfPayment">Mode of Payment *</Label>
                    <Select
                      value={formData.modeOfPayment}
                      onValueChange={(value) => setFormData({ ...formData, modeOfPayment: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.transactionType === 'income'
                          ? incomePaymentModes
                          : formData.transactionType === 'savings'
                            ? savingsPaymentModes
                            : expensePaymentModes
                        ).map((mode) => (
                          <SelectItem key={mode} value={mode} className="capitalize">
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Transaction'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TransactionDialog;
