import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from '~/src/lib/firebase';
import { type Transaction } from '~/src/types';
export const getAllTransaction = async (organizationId: string) => {
  if (organizationId) return;
  const transactionsQuery = query(
    collection(db, `organizations/${organizationId}/transactions`),
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
    return transactionsData;
  });
  
  return () => unsubscribe;
};
