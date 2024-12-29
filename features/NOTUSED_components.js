// features/components.js

const fs = require("fs");
const path = require("path");
const { executeCommand } = require("../utils");

// Get the project directory from command-line arguments
const appDirectory = process.argv[2];
if (!appDirectory) {
  console.error("Please provide the path to your React app directory.");
  process.exit(1);
}

// Define routesDirectory
const routesDirectory = path.join(appDirectory, "src", "routes");
if (!fs.existsSync(routesDirectory)) {
  fs.mkdirSync(routesDirectory, { recursive: true });
  console.log(`Created directory: ${routesDirectory}`);
}

const contextDirectory = path.join(appDirectory, "src", "context");
if (!fs.existsSync(contextDirectory)) {
  fs.mkdirSync(contextDirectory, { recursive: true });
  console.log(`Created directory: ${contextDirectory}`);
}

(async function addTemplateComponents() {
  console.log("\n--- Adding Template Components ---");

  // Install React Router DOM
  executeCommand("npm install react-router-dom", { cwd: appDirectory });
  executeCommand("npm install liamc9npm@latest", { cwd: appDirectory });

  // Add NotificationContext
  const notificationContextPath = path.join(contextDirectory, "NotificationContext.js");
  const notificationContextContent = `
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
  `;
  fs.writeFileSync(notificationContextPath, notificationContextContent.trim());
  console.log(`Created: ${notificationContextPath}`);

   // Add AuthContext
   const authContextPath = path.join(contextDirectory, "AuthContext.js");
   const authContextContent = `
// AuthContext.js
// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase-config'; // Ensure correct path
import {
  onAuthStateChanged,
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

// Create Auth Context
const AuthContext = createContext();

// Custom Hook to use Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider Component
export function AuthProvider({ children }) {
  // State Variables
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication Functions

  /**
   * Log in a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<firebase.auth.UserCredential>}
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  /**
   * Sign up a new user with email, password, and username.
   * @param {string} email
   * @param {string} password
   * @param {string} username
   * @returns {Promise<firebase.auth.UserCredential>}
   */
  const signup = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, { displayName: username });

      // Send email verification
      await firebaseSendEmailVerification(user);

      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      // Optionally sign out the user to prevent unverified access
      await signOut(auth);

      return userCredential;
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    }
  };

  /**
   * Log out the current user.
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  };

  /**
   * Reset password for a given email.
   * @param {string} email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw error;
    }
  };

  /**
   * Log in with Google provider.
   * @returns {Promise<void>}
   */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Create user data
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

  /**
   * Log in with Apple provider.
   * @returns {Promise<void>}
   */
  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user data exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        // Create user data
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

  // User Data Management Functions

  /**
   * Fetch user data from Firestore.
   * @param {string} uid
   * @returns {Promise<Object>}
   */
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Fetch User Data Error:', error);
      throw error;
    }
  };

  /**
   * Update user data in Firestore.
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  const updateUserData = async (data) => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, data);
      // Update local state
      setUserData((prevData) => ({
        ...prevData,
        ...data,
      }));
    } catch (error) {
      console.error('Update User Data Error:', error);
      throw error;
    }
  };

  /**
   * Delete user data from Firestore.
   * @returns {Promise<void>}
   */
  const deleteUserData = async () => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error('Delete User Data Error:', error);
      throw error;
    }
  };

  // Reauthentication Functions

  /**
   * Reauthenticate user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const reauthenticateWithEmail = async (email, password) => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      console.error('Reauthentication Error:', error);
      throw error;
    }
  };

  /**
   * Reauthenticate user with Google provider.
   * @returns {Promise<void>}
   */
  const reauthenticateWithGoogle = async () => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    const provider = new GoogleAuthProvider();
    try {
      await reauthenticateWithPopup(currentUser, provider);
    } catch (error) {
      console.error('Reauthentication with Google Error:', error);
      throw error;
    }
  };

  // Account Deletion Functions

  /**
   * Delete Firebase Auth user (requires reauthentication).
   * @returns {Promise<void>}
   */
  const deleteFirebaseAccount = async () => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    try {
      await deleteUser(currentUser);
    } catch (error) {
      console.error('Delete Firebase Account Error:', error);
      throw error;
    }
  };

  /**
   * Centralized function to delete user account and data.
   * Handles reauthentication based on the user's sign-in provider.
   * @param {string} [password] - Required if using Email/Password provider.
   * @returns {Promise<void>}
   */
  const deleteAccount = async (password = null) => {
    if (!currentUser) throw new Error('No user is currently signed in.');

    // Determine sign-in provider
    const providerData = currentUser.providerData;
    if (providerData.length === 0) {
      throw new Error('No provider data available.');
    }

    const providerId = providerData[0].providerId;

    try {
      // Reauthenticate based on provider
      if (providerId === 'google.com') {
        await reauthenticateWithGoogle();
      } else if (providerId === 'password') {
        if (!password) {
          throw new Error('Password is required for reauthentication.');
        }
        await reauthenticateWithEmail(currentUser.email, password);
      } else {
        throw new Error('Unsupported provider');
      }

      // Delete user data from Firestore
      await deleteUserData();

      // Delete Firebase Auth user
      await deleteFirebaseAccount();
    } catch (error) {
      console.error('Delete Account Error:', error);
      throw error;
    }
  };

  // Effect to handle auth state changes and set up Firestore listener
  useEffect(() => {
    let unsubscribeUserData = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);

      if (user) {
        // User is signed in, set up real-time listener for user data
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeUserData = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user data:', error);
            setUserData(null);
            setLoading(false);
          }
        );
      } else {
        // User is signed out
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeUserData();
    };
  }, []);

  // Context Value
  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithApple,
    fetchUserData, // Fetch user data manually if needed
    updateUserData,
    deleteUserData,
    reauthenticateWithEmail,
    reauthenticateWithGoogle,
    deleteFirebaseAccount,
    deleteAccount, // Centralized delete account function
  };

  // Provide Context to Children
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

   `;
   fs.writeFileSync(authContextPath, authContextContent.trim());
   console.log(`Created: ${authContextPath}`);


  // Modify `index.js` and include providers
  const indexJsPath = path.join(appDirectory, "src", "index.js");
  const indexJsContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Root from './routes/Root';
import Login from './routes/Login';
import Home from './routes/Home';
import SettingsPage from './routes/Settings';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  { path: '', element: <Root />,
    children: [
      {
        index: true, // This makes it the default route for the parent path
        element: <Navigate to="/home" replace />, // Redirect to /home
      },
      { path: 'login', element: <Login />, },
      { path: 'home', element: <Home />, },
      { path: 'settings', element: <SettingsPage />, },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <AuthProvider>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </AuthProvider>
  </React.StrictMode>
);
  `;
  fs.writeFileSync(indexJsPath, indexJsContent.trim());
  console.log(`Modified: ${indexJsPath}`);

  // Create `Root.jsx`
  const rootPath = path.join(routesDirectory, "Root.jsx");
  const rootContent = `
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  TopWSideNav,
  TopNavBar2,
  BottomNav,
  HomeIcon,
  SearchIcon2,
  UserIcon2,
  CogIcon,
  LoginIcon,
} from "liamc9npm";
import { useNotifications } from "../context/NotificationContext";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth functions

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  // Scroll to top whenever the location.pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Paths where TopNavBar should be hidden
  const topNavHiddenPaths = ["/login"];

  // Paths where BottomNavBar should be hidden
  const bottomNavHiddenPaths = ["/login"];

  const shouldHideTopNav = () => topNavHiddenPaths.includes(location.pathname);
  const shouldHideBottomNav = () => bottomNavHiddenPaths.includes(location.pathname);

  // Firebase Logout Function
  const handleLogout = async () => {
    const auth = getAuth(); // Get Firebase Auth instance
    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out");
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Dynamic bottom navigation items based on notification context
  const bottomNavItems = [
    { text: "Home", icon: HomeIcon, path: "/home", hasNotification: notifications.home },
    { text: "Search", icon: SearchIcon2, path: "/search", hasNotification: notifications.search },
    { text: "Profile", icon: UserIcon2, path: "/profile", hasNotification: notifications.profile },
    { text: "Settings", icon: CogIcon, path: "/settings", hasNotification: notifications.settings },
  ];

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden bg-white">
      {/* Top Navigation Bar */}
      {!shouldHideTopNav() && (
        <>
          {/* Mobile Top Navbar */}
          <div className="md:hidden">
            <TopWSideNav
              appName="MyApp"
              signInColor="#000000"
              navLinks={[
                { name: "Home", path: "/home", Icon: HomeIcon },
                { name: "Web Development", path: "/webdev", Icon: CogIcon },
                { name: "Analytics", path: "/analytics", Icon: LoginIcon },
              ]}
              username="Jane Smith"
              profilePic="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              onLogout={handleLogout} // Pass the Firebase logout function
            />
          </div>
          {/* Desktop Top Navbar */}
          <div className="hidden md:block">
            <TopNavBar2 menuItems={["Home", "About", "Services", "Contact"]} activeTab="Services" />
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      {!shouldHideBottomNav() && (
        <div className="md:hidden">
          <BottomNav items={bottomNavItems} />
        </div>
      )}
      <div className="mb-16">
      {/* Main Content */}
      <Outlet />
      </div>
    </div>
  );
}

  `;
  fs.writeFileSync(rootPath, rootContent.trim());
  console.log(`Created: ${rootPath}`);


  // Create `Login.jsx`
  const loginPath = path.join(routesDirectory, "Login.jsx");
  const loginContent = `
// Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust the path according to your file structure
import { AuthPageView } from 'liamc9npm'; // Assuming this is the UI component you're using
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, signup, resetPassword, loginWithGoogle, loginWithApple, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setResetEmailSent(false);
    setIsLoading(true);
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        navigate('/home'); // Replace with your desired route
      } else {
        await logout();
        setError('Your email is not verified. Please verify your email.');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError('Invalid email or password. Please try again.');
    }
  };

  // Handle user signup
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== reenterPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions.');
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password, username);
      setIsSignupComplete(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      setResetEmailSent(false);
      return;
    }

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setError('');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
      setResetEmailSent(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate('/home'); // Replace with your desired route
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  // Handle Apple sign-in
  const handleAppleSignIn = async () => {
    try {
      await loginWithApple();
      navigate('/home'); // Replace with your desired route
    } catch (error) {
      setError('Failed to sign in with Apple. Please try again.');
    }
  };

  return (
    <div className='p-4'>
    <AuthPageView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      username={username}
      setUsername={setUsername}
      reenterPassword={reenterPassword}
      setReenterPassword={setReenterPassword}
      error={error}
      isSignupComplete={isSignupComplete}
      isLoading={isLoading}
      termsAccepted={termsAccepted}
      setTermsAccepted={setTermsAccepted}
      handleSignup={handleSignup}
      handleLogin={handleLogin}
      setShowSignUp={setShowSignUp}
      isSignUp={showSignUp}
      onForgotPassword={handleForgotPassword}
      resetEmailSent={resetEmailSent}
      onGoogleSignIn={handleGoogleSignIn}
      onAppleSignIn={handleAppleSignIn}
      themeColor="#B08B5B"
    />
    </div>
  );
};

export default Login;
      `;

  fs.writeFileSync(loginPath, loginContent.trim());
  console.log(`Created: ${loginPath}`);

  // Create `Home.jsx`
  const homePath = path.join(routesDirectory, "Home.jsx");
  const homeContent = `
// Home.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from "../context/NotificationContext";

export default function Home() {
  const { currentUser, userData, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(userData?.username || '');
  const [age, setAge] = useState(userData?.age || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { notifications, addNotification, clearNotification } = useNotifications();

    useEffect(() => {
    console.log("Current notifications:", notifications);
  }, [notifications]);

  // Update local state when userData changes
  useEffect(() => {
    setUsername(userData?.username || '');
    setAge(userData?.age || '');
    setEmail(currentUser?.email || '');
  }, [userData, currentUser]);

  // Handle updating user data
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateUserData({ username, age });
      setSuccess('User data updated successfully!');
    } catch (error) {
      setError('Failed to update user data.');
      console.error('Error updating user data:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      setError('Failed to logout.');
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    // If not authenticated, redirect to login
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      <p className="mb-4">This page demonstrates the usage of the AuthContext.</p>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Username:</strong> {userData?.username || 'Not set'}
        </p>
        <p>
          <strong>Age:</strong> {userData?.age || 'Not set'}
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Update Username:</label>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Update Age:</label>
          <input
            type="number"
            className="border border-gray-300 p-2 rounded w-full"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Update User Data
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mt-6"
      >
        Logout
      </button>
      <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      <p className="mb-4">Practice using the Notification Context by interacting with the buttons below.</p>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Manage Notifications for Home:</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => addNotification("home")}
          >
            Add Notification to Home
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => clearNotification("home")}
          >
            Clear Notification from Home
          </button>
        </div>

        <div>
          <h2 className="font-semibold">Manage Notifications for Search:</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => addNotification("search")}
          >
            Add Notification to Search
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => clearNotification("search")}
          >
            Clear Notification from Search
          </button>
        </div>

        <div>
          <h2 className="font-semibold">Manage Notifications for Profile:</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => addNotification("profile")}
          >
            Add Notification to Profile
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => clearNotification("profile")}
          >
            Clear Notification from Profile
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
      `;
  fs.writeFileSync(homePath, homeContent.trim());
  console.log(`Created: ${homePath}`);

  console.log("Template components have been added!");
})();



  // Create `Settings.jsx`
  const settingsPath = path.join(routesDirectory, "Settings.jsx");
  const settingsContent = `
// IMPORTS
import React from 'react';
import { Settings, UsersIcon, NotificationsIcon } from 'liamc9npm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// CREATE FUNCTION
function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // HTML
  return (
    <div>
      <Settings
        settings={[
          {
            category: 'Account',
            icon: UsersIcon,
            text: 'Manage Account',
            link: '/manageaccount',
          },
          {
            category: 'Account',
            icon: NotificationsIcon,
            text: 'Manage Billing',
            link: '/managebilling',
          },
          {
            category: 'Notifications',
            icon: NotificationsIcon,
            text: 'Email Notifications',
            link: '/email-notifications',
          },
        ]}
        onLogout={handleLogout} // Pass the handleLogout function
      />
    </div>
  );
}

export default SettingsPage;
      `;
  fs.writeFileSync(settingsPath, settingsContent.trim());
  console.log(`Created: ${settingsPath}`);
