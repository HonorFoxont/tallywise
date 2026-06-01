import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '~/src/contexts/AuthContext';
import { db } from '~/src/lib/firebase';
import { type Transaction } from '~/src/types';
export default function useTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.organizationId) return;
    const transactionsQuery = query(
      collection(db, `organizations/${user.organizationId}/transactions`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Transaction[];
      setTransactions(transactionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.organizationId]);
  return { transactions, loading };
}
