import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { auth, db, googleProvider } from '@/lib/firebase';
import { type Organization, type User } from '@/types';

import { getUserByEmail } from '../apis/users';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser && firebaseUser?.email) {
        try {
          const userData = await getUserByEmail(firebaseUser.email);

          if (!userData.isActive) {
            toast.error('Your account is inactive. Please contact support.');
            setLoading(false);
            return;
          }

          if (!userData.organizationId) {
            toast.error('No organization assigned to your account.');
            setLoading(false);
            return;
          }

          const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data() as Organization;

            if (!orgData.isActive) {
              toast.error('Your organization is inactive. Please contact admin.');
              setLoading(false);
              return;
            }

            // Everything is valid
            setUser(userData);
            setLoading(false);
          } else {
            toast.error('Organization record not found.');
            setLoading(false);
          }
        } catch (error) {
          toast.error(error.message);
          setLoading(false);
        }
      } else {
        if (!window.location.pathname.includes('login')) {
          window.location.href = '/login';
        }
        setLoading(false);
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      toast.error('Error signing in with Google: ' + error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      toast.error('Error signing out: ' + error.message);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
