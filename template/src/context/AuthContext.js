// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase-config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification as firebaseSendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; // Import from react-firebase-hooks

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [firebaseUser, loading, error] = useAuthState(auth); 
  const [userData, setUserData] = useState(null);

  // Once we have firebaseUser from react-firebase-hooks,
  // we can listen to their Firestore userData in real-time.
  useEffect(() => {
    if (!firebaseUser) {
      setUserData(null);
      return;
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        setUserData(docSnap.exists() ? docSnap.data() : null);
      },
      (err) => {
        console.error('Error fetching user data:', err);
        setUserData(null);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await firebaseSendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      // Optional: sign out user after signup to force email verification
      // await signOut(auth);

      return userCredential;
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // If user doesn't exist in Firestore, create a record
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          username: user.displayName || '',
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error;
    }
  };

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          username: user.displayName || '',
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Apple Login Error:', error);
      throw error;
    }
  };

  const updateUserData = async (data) => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, data);
    setUserData((prev) => ({ ...prev, ...data }));
  };

  const deleteUserData = async () => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    await deleteDoc(doc(db, 'users', firebaseUser.uid));
  };

  const reauthenticateWithEmail = async (email, password) => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(firebaseUser, credential);
  };

  const reauthenticateWithGoogle = async () => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(firebaseUser, provider);
  };

  const deleteFirebaseAccount = async () => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    await deleteUser(firebaseUser);
  };

  const deleteAccount = async (password = null) => {
    if (!firebaseUser) throw new Error('No user is currently signed in.');
    const providerData = firebaseUser.providerData;
    if (providerData.length === 0) {
      throw new Error('No provider data available.');
    }
    const providerId = providerData[0].providerId;

    if (providerId === 'google.com') {
      await reauthenticateWithGoogle();
    } else if (providerId === 'password') {
      if (!password) throw new Error('Password is required for reauthentication.');
      await reauthenticateWithEmail(firebaseUser.email, password);
    } else {
      throw new Error(`Unsupported provider: ${providerId}`);
    }

    await deleteUserData();
    await deleteFirebaseAccount();
  };

  const value = {
    currentUser: firebaseUser,
    userData,
    loading, // you can still use loading from useAuthState
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithApple,
    updateUserData,
    deleteUserData,
    reauthenticateWithEmail,
    reauthenticateWithGoogle,
    deleteFirebaseAccount,
    deleteAccount,
  };

  // Only render children when not loading auth state
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
