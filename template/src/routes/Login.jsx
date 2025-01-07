// src/components/Login.js

import React from "react";
import LoginView from "../views/LoginView"; // Adjust the path as necessary
import { useAuth } from "../context/AuthContext"; // Ensure this context is generic
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({
  branding, // Optional branding props to customize the UI
  themeColor, // Optional theme color
}) => {
  const {
    login,
    signup,
    resetPassword,
    loginWithGoogle,
    logout,
  } = useAuth(); // Ensure useAuth is a generic auth context

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/"; // Default to home if no redirect route

  const handleLogin = async ({ email, password, setError }) => {
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        navigate(from); // Redirect to the original page
      } else {
        await logout();
        setError("Your email is not verified. Please verify your email.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleSignup = async ({ email, password, setIsSignupComplete, setError }) => {
    try {
      await signup(email, password);
      setIsSignupComplete(true);
      toast.success("Signup successful! Please check your email for verification.");
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
    }
  };


  const handleForgotPassword = async ({ email, setResetEmailSent, setError }) => {
    try {
      await resetPassword(email);
      setResetEmailSent(true);
      toast.success(`Password reset email sent to ${email}.`);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    }
  };

  /**
   * Handles Google sign-in.
   */
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate(from); // Redirect to the original page or a default route
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <LoginView
        handleSignup={handleSignup}
        handleLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
        themeColor={themeColor || "#A855F7"}
        branding={branding || { appName: "YourApp", primaryIcon: null }}
      />
    </div>
  );
};

export default Login;
