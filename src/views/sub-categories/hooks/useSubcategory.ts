import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { type SubCategory } from '@/types';

export default function useSubcategory(categoryId: string | null) {
  const { user, loading: authLoading } = useAuth();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.organizationId || authLoading) {
      setSubCategories([]);
      setLoading(false);
      return;
    }
    if (!categoryId) {
      setLoading(true);
      // Step 1: fetch all categories under the organization
      const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
      const unsubscribeCategories = onSnapshot(categoriesRef, async (categorySnap) => {
        const allSubCategories: SubCategory[] = [];

        // Step 2: for each category, fetch its subcategories
        const subUnsubscribers = await Promise.all(
          categorySnap.docs.map(async (catDoc) => {
            const subRef = collection(
              db,
              `organizations/${user.organizationId}/categories/${catDoc.id}/subCategories`
            );

            return onSnapshot(
              subRef,
              (subSnap) => {
                subSnap.docs.forEach((subDoc) => {
                  allSubCategories.push({
                    id: subDoc.id,
                    ...subDoc.data(),
                  } as SubCategory);
                });
                setSubCategories([...allSubCategories]);
                setLoading(false);
              },
              (error) => {
                console.error('Error fetching subcategories:', error);
                toast.error('Failed to fetch subcategories');
                setLoading(false);
              }
            );
          })
        );

        // Clean up subcategory listeners when categories change
        return () => subUnsubscribers.forEach((unsub) => unsub());
      });

      return () => unsubscribeCategories();
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
