// src/components/Profile.js

import React, { useState } from "react";
import ProfileView from "../views/ProfileView"; // Adjust the path as necessary
import { useAuth } from "../context/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase-config";

const Profile = () => {
  const { currentUser, userData, updateUserData, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const storage = getStorage();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSaveChanges = async ({ firstName, newProfilePicFile, profilePic }) => {
    if (!firstName.trim()) {
      toast.error("First name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);

      let downloadURL = userData?.photoURL || "https://via.placeholder.com/120";

      // If a new profile picture is selected, upload it to Firebase Storage
      if (newProfilePicFile) {
        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${newProfilePicFile.name}`);
        await uploadBytes(storageRef, newProfilePicFile);
        downloadURL = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, "users", currentUser.uid);

      // Determine if profile is complete
      const isProfileComplete = firstName.trim() !== "" && downloadURL !== "https://via.placeholder.com/120";

      // Update Firestore document
      await updateDoc(docRef, {
        displayName: firstName,
        photoURL: downloadURL,
        profileComplete: isProfileComplete,
      });

      // Update user data in context
      await updateUserData({
        displayName: firstName,
        photoURL: downloadURL,
        profileComplete: isProfileComplete,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles confirming account deletion.
   * This function is generic and does not include any app-specific logic.
   */
  const confirmDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found.");
      }

      const providerData = user.providerData;
      if (providerData.length === 0) {
        throw new Error("No provider data available.");
      }

      const providerId = providerData[0].providerId;

      // Re-authenticate the user based on their sign-in provider
      if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        throw new Error(`Unsupported provider: ${providerId}`);
      }

      // Proceed to delete the user
      await deleteUser(user);

      // Log out the user and navigate to the login page
      await logout();
      toast.success("Account deleted successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);

      // Handle specific Firebase auth errors
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please re-authenticate to delete your account.");
      } else if (error.message.includes("Unsupported provider")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete account. Please try again later.");
      }
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <ProfileView
      handleSaveChanges={handleSaveChanges}
      isSaving={isSaving}
      showDeleteModal={showDeleteModal}
      confirmDeleteAccount={confirmDeleteAccount}
      setShowDeleteModal={setShowDeleteModal}
      currentUser={currentUser}
      userData={userData} // Pass user data to initialize state in ProfileView
    />
  );
};

export default Profile;
