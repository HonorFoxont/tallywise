import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from '~/src/contexts/AuthContext';
import { db } from '~/src/lib/firebase';
import { type Category, type TransactionType } from '~/src/types';

export default function useCategories(transaction: TransactionType | null) {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch all categories
    if (!transaction) {
      if (!user?.organizationId) return;
      const q = query(collection(db, `organizations/${user.organizationId}/categories`));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData);
      });
      return () => unsubscribe();
    } else {
      // Fetch categories based on transaction type
      const fetchCategories = () => {
        if (!user?.organizationId || authLoading) {
          if (!authLoading && !user?.organizationId) {
            toast.error('No organization assigned to user');
          }
          setLoading(false);
          return;
        }

        setLoading(true);
        const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
        const q = query(categoriesRef, where('type', '==', transaction));

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedCategories = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate(),
            })) as Category[];
            setCategories(fetchedCategories);
            setLoading(false);
          },
          (error) => {
            toast.error('Error fetching categories');
            console.error('Error fetching categories', error);
          }
        );
        return () => unsubscribe();
      };

      fetchCategories();
    }
  }, [user?.organizationId, transaction, authLoading]);

  return { categories, loading, authLoading };
}
