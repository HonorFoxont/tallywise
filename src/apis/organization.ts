import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from '~/src/lib/firebase';

import ApiError from '../errors/ApiError';
import { type Organization } from '../types';

// params type
type NewOrganizationParams = {
  name: string;
  isActive?: boolean;
};
type EditOrganizationParams = {
  organizationId: string;
  name?: string;
  isActive?: boolean;
};

// 🔹 Hook for subscribing to organizations in React components
export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'organizations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Organization);
      setOrganizations(fetched);
    });

    return () => unsubscribe();
  }, []);

  return organizations;
}

// 🔹 One-time fetch
export async function getOrganizations(): Promise<Organization[]> {
  const q = query(collection(db, 'organizations'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Organization);
}

// 🔹 Create org with duplicate name check
export async function createOrganization(params: NewOrganizationParams): Promise<Organization> {
  if (!params.name) {
    throw new ApiError('Organization name must be defined');
  }

  // fetch all orgs to check duplicate
  const existing = await getOrganizations();
  const isDuplicate = existing.some((org) => org.name.toLowerCase() === params.name.toLowerCase());

  if (isDuplicate) {
    throw new ApiError('Organization name already exists');
  }

  const newOrganization: Omit<Organization, 'id'> = {
    name: params.name,
    isActive: params.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'organizations'), newOrganization);
    return { id: docRef.id, ...newOrganization };
  } catch (err: any) {
    throw new ApiError(err.message || 'Failed to create organization');
  }
}

// Edit Existing Organizations
export async function editOrganization(params: EditOrganizationParams): Promise<void> {
  if (!params.organizationId) {
    throw new ApiError('Organization ID must be defined');
  }

  const updates: Partial<Omit<Organization, 'id'>> = {
    updatedAt: new Date().toISOString(),
  };

  if (params.name) {
    // 🔹 Check duplicate names before updating
    const existing = await getOrganizations();
    const isDuplicate = existing.some(
      (org) =>
        org.id !== params.organizationId && org.name.toLowerCase() === params.name!.toLowerCase()
    );

    if (isDuplicate) {
      throw new ApiError('Organization name already exists');
    }

    updates.name = params.name;
  }

  if (params.isActive !== undefined) {
    updates.isActive = params.isActive;
  }

  try {
    const orgRef = doc(db, 'organizations', params.organizationId);
    await updateDoc(orgRef, updates);
  } catch (err: any) {
    throw new ApiError(err.message || 'Failed to update organization');
  }
}
