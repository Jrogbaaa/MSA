'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    // Set up authentication state listener
    const initializeAuth = async () => {
      console.log('Initializing authentication...');
      
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser ? `User signed in: ${firebaseUser.email}` : 'User signed out');
        
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            let userData: User;
            
            if (userDoc.exists()) {
              userData = {
                id: firebaseUser.uid,
                ...userDoc.data(),
              } as User;
              console.log('User data loaded from Firestore:', userData.email);
            } else {
              // Create new user document
              userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                lastName: firebaseUser.displayName?.split(' ')[1] || '',
                photoURL: firebaseUser.photoURL || undefined,
                role: 'tenant',
                savedProperties: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), userData);
              console.log('New user document created:', userData.email);
            }
            
            setUser(userData);
          } catch (error: any) {
            console.warn('Firestore access failed, using basic user data:', error.message);
            // If offline or other Firestore error, create a basic user object from Firebase Auth
            const basicUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'tenant',
              savedProperties: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            console.log('Using basic user data (offline mode):', basicUser.email);
            setUser(basicUser);
          }
        } else {
          console.log('No authenticated user found');
          setUser(null);
        }
        
        setLoading(false);
        if (!authInitialized) {
          setAuthInitialized(true);
          console.log('Authentication system initialized');
        }
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting email sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Attempting sign up...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update the user profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email: user.email!,
        firstName,
        lastName,
        photoURL: user.photoURL || undefined,
        role: 'tenant',
        savedProperties: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('Sign up successful');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await firebaseSignOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'users', user.id), updatedUser);
      
      if (data.firstName || data.lastName) {
        await updateProfile(auth.currentUser!, {
          displayName: `${data.firstName || user.firstName} ${data.lastName || user.lastName}`,
        });
      }

      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile: updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 