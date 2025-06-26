import { addDoc, collection } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

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

const TransactionDialog: React.FC = () => {
  const { user } = useAuth();
  // const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transactionType: '',
    category: '',
    subCategory: '',
    note: '',
    amountTotal: '',
    advancePaid: '',
    modeOfPayment: '',
  });

  const incomeCategories = ['studio', 'glasshouse', 'event'];
  const savingsCategories = ['bank', 'savings account', 'other'];
  const expenseCategories = ['asset', 'liabity'];

  const incomeSubCategories = ['passport', 'frames', 'rentals', 'mirror frame', 'wedding Shoot'];
  const savingsSubCategories = ['NMB', 'SBI', 'Sudarshan', 'Janakalyan'];
  const expenseSubCategories = [
    'business asset',
    'external asset',
    'staff salary',
    'food',
    'donation',
    'other',
  ];

  const incomePaymentModes = ['cash', 'fonepay', 'esewa', 'credit'];
  const savingsPaymentModes = ['cash'];
  const expensePaymentModes = ['cash'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

      // toast({
      //   title: 'Success',
      //   description: 'Transaction created successfully',
      // });

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
      // toast({
      //   title: 'Error',
      //   description: 'Failed to create transaction',
      //   variant: 'destructive',
      // });
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
                  onValueChange={(value) => setFormData({ ...formData, transactionType: value })}
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

              {formData.transactionType === 'income' && (
                <>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeSubCategories.map((subCat) => (
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
                        {incomePaymentModes.map((mode) => (
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

              {formData.transactionType === 'savings' && (
                <>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingsCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {savingsSubCategories.map((subCat) => (
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
                        {savingsPaymentModes.map((mode) => (
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

              {formData.transactionType === 'expense' && (
                <>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseSubCategories.map((subCat) => (
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
                        {expensePaymentModes.map((mode) => (
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
