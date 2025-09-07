import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import ApiError from '../errors/ApiError';
import { db } from '../lib/firebase';
import { type User } from '../types';

type ListUserParams = {
  organizationId: string;
  isActive?: boolean;
};

export async function listUsers(params: ListUserParams) {
  const conditions = [where('organizationId', '==', params.organizationId)];

  if (params.isActive !== undefined) {
    conditions.push(where('isActive', '==', params.isActive));
  }

  const q = query(collection(db, 'users'), ...conditions);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getUserByEmail(email: string): Promise<User> {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new ApiError('User record not found.');
  }

  const userDoc = snap.docs[0];
  const userData = userDoc?.data?.() as User;

  if (!userData) {
    throw new ApiError('User record not found.');
  }

  return userData;
}

export async function getUserById(id: string): Promise<User> {
  const userDoc = await getDoc(doc(db, 'users', id));
  if (!userDoc.exists()) {
    throw new ApiError('User record not found.');
  }
  return userDoc.data() as User;
}
