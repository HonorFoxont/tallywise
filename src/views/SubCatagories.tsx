import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Card } from '@/components/ui/card';
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'saving';
}

interface SubCategory {
  name: string;
  createdAt: Date;
}

const SubCategories = () => {
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<'income' | 'expense' | 'saving'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || authLoading) {
        if (!authLoading && !user?.organizationId) {
          toast.error('No organization assigned to user');
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
        const q = query(categoriesRef, where('type', '==', transaction));
        const querySnapshot = await getDocs(q);
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCategories);
        setSelectedCategory(fetchedCategories[0]?.id || null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user?.organizationId, transaction, authLoading]);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!user?.organizationId || !selectedCategory || authLoading) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const categoryDoc = await getDoc(
          doc(db, `organizations/${user.organizationId}/categories`, selectedCategory)
        );
        if (categoryDoc.exists()) {
          const subCategoriesData = categoryDoc.data().subCategories || [];
          setSubCategories(
            subCategoriesData.map((sub: any) => ({
              ...sub,
              createdAt: sub.createdAt.toDate(),
            }))
          );
        } else {
          setSubCategories([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to fetch subcategories');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [user?.organizationId, selectedCategory, authLoading]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SubCategory</h1>
        <p className="text-gray-600">View your subcategories.</p>
      </div>
      <Card className="flex h-max items-center justify-center p-0">
        <ToggleGroup
          type="single"
          className="w-full"
          defaultValue="income"
          onValueChange={(value) => setTransaction(value as 'income' | 'expense' | 'saving')}
        >
          <ToggleGroupItem value="income" aria-label="Toggle Income">
            Income
          </ToggleGroupItem>
          <ToggleGroupItem value="savings" aria-label="Toggle Savings">
            Savings
          </ToggleGroupItem>
          <ToggleGroupItem value="expense" aria-label="Toggle Expense">
            Expense
          </ToggleGroupItem>
        </ToggleGroup>
      </Card>

      <Card>
        <div className="mx-auto w-[95%] py-4">
          <h1 className="text-bold text-2xl">SubCategory:</h1>
        </div>
        <div className="mx-auto w-[95%] py-4">
          <Select
            value={selectedCategory || ''}
            onValueChange={setSelectedCategory}
            disabled={loading || authLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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
        <Table className="mx-auto w-[95%]">
          <TableCaption>A list of your subcategories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>SubCategory</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || authLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : subCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No subcategories found.</TableCell>
              </TableRow>
            ) : (
              subCategories.map((subCategory, index) => (
                <TableRow key={index}>
                  <TableCell>{subCategory.name}</TableCell>
                  <TableCell>{subCategory.createdAt.toDateString()}</TableCell>
                  <TableCell>
                    <SquarePen className="cursor-pointer" />
                  </TableCell>
                  <TableCell>
                    <Trash2 className="cursor-pointer" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SubCategories;
