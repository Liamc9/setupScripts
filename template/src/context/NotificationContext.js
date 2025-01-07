import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Ensure you have Firebase initialized
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Hook to use the context
export const useNotifications = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    home: false,
    search: false,
    profile: false,
    settings: false,
  });

  const { currentUser } = useAuth(); // Get the current user from AuthContext

  // Fetch notifications from Firestore when the user logs in
  useEffect(() => {
    if (currentUser) {
      const fetchNotifications = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setNotifications(userData.notifications || {});
          } else {
            // If no notifications field exists, initialize it
            await setDoc(
              docRef,
              { notifications: notifications },
              { merge: true }
            );
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };

      fetchNotifications();
    } else {
      // User is logged out, reset notifications
      setNotifications({
        home: false,
        search: false,
        profile: false,
        settings: false,
      });
    }
  }, [currentUser]);

  // Helper function to save notifications to Firestore
  const saveNotificationsToFirestore = async (updatedNotifications) => {
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          docRef,
          { notifications: updatedNotifications },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    }
  };

  // Add a notification
  const addNotification = (key) => {
    const updatedNotifications = { ...notifications, [key]: true };
    setNotifications(updatedNotifications);
    saveNotificationsToFirestore(updatedNotifications);
  };

  // Clear a notification
  const clearNotification = (key) => {
    const updatedNotifications = { ...notifications, [key]: false };
    setNotifications(updatedNotifications);
    saveNotificationsToFirestore(updatedNotifications);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};