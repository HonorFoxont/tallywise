import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { type UserRole } from '~/src/types/users';

import ApiError from '../errors/ApiError';
import { db } from '../lib/firebase';
import { type User } from '../types';

type ListUserParams = {
  organizationId: string;
  isActive?: boolean;
};

type CreateUserParams = {
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  isActive?: boolean;
  photoURL?: string;
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

export async function getUserCount(organizationId: string) {
  const userList = await listUsers({ organizationId });
  return userList.length;
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

  userData.id = userDoc?.id as string;

  return userData;
}

export async function getUserById(id: string): Promise<User> {
  const userDoc = await getDoc(doc(db, 'users', id));
  if (!userDoc.exists()) {
    throw new ApiError('User record not found.');
  }
  return userDoc.data() as User;
}

export async function createUser(params: CreateUserParams): Promise<User> {
  const newUser: Omit<User, 'id'> = {
    email: params.email,
    name: params.name,
    photoURL: params.photoURL ?? '', // allow override if provided
    role: params.role,
    organizationId: params.organizationId,
    isActive: params.isActive ?? true,
    createdAt: new Date().toDateString(),
    updatedAt: new Date().toDateString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'users'), newUser);

    return { id: docRef.id, ...newUser };
  } catch (error: any) {
    throw new ApiError(error.message || 'Failed to create user');
  }
}
