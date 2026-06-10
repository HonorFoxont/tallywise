import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { type SubCategory } from '@/types';

export default function useSubcategory(categoryId: string) {
  const { user, loading: authLoading } = useAuth();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.organizationId || !categoryId || authLoading) {
      setSubCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const subCategoriesRef = collection(
      db,
      `organizations/${user.organizationId}/categories/${categoryId}/subCategories`
    );
    const unsubscribe = onSnapshot(
      subCategoriesRef,
      (querySnapshot) => {
        const fetchedSubCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as SubCategory[];
        setSubCategories(fetchedSubCategories);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to fetch subcategories');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.organizationId, categoryId, authLoading]);
  return { subCategories, loading };
}
