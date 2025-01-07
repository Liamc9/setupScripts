// src/components/ProfileView.js

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Input, DeleteModal } from "liamc9npm";
import { ChevronLeftIcon } from "liamc9npm";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Styled Components
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;

  svg {
    width: 24px;
    height: 24px;
    color: black;
  }
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: black;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #333;
  }

  &:disabled {
    background-color: #777;
    cursor: not-allowed;
  }
`;

const ProfileImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-image: url(${(props) => props.image || "https://via.placeholder.com/120"});
  background-size: cover;
  background-position: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;

  &:hover::after {
    content: "Change";
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
  }
`;

const EditText = styled.span`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InputField = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  font-size: 1rem;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const DeleteButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  font-size: 1rem;
  color: #fff;
  background-color: #e74c3c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const ProfileView = ({
  handleSaveChanges,      // Function to handle saving changes (passed from parent)
  isSaving,               // Boolean indicating if save operation is in progress
  showDeleteModal,        // Boolean to control visibility of delete modal
  confirmDeleteAccount,   // Function to confirm account deletion (passed from parent)
  setShowDeleteModal,     // Function to toggle delete modal visibility (passed from parent)
  currentUser,            // Current authenticated user (passed from parent)
  userData,               // User data fetched from backend (passed from parent)
}) => {
  // Local State Management
  const [firstName, setFirstName] = useState("");
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/120");
  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Handler to select a new profile picture
  const handleProfilePicSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and GIF files are allowed.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB.");
        return;
      }

      setNewProfilePicFile(file);
      const previewURL = URL.createObjectURL(file);
      setProfilePic(previewURL);
    }
  };

  // Cleanup the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (newProfilePicFile) {
        URL.revokeObjectURL(profilePic);
      }
    };
  }, [newProfilePicFile, profilePic]);

  // Navigate back to a specified route
  const handleNavigateBack = () => {
    navigate(`/settings/${currentUser?.uid}`);
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Initialize local state with user data when available
  useEffect(() => {
    if (userData) {
      setFirstName(userData.displayName || "");
      setProfilePic(userData.photoURL || "https://via.placeholder.com/120");
    }
  }, [userData]);

  // Handle the save changes button click
  const onSaveChanges = () => {
    handleSaveChanges({ firstName, newProfilePicFile, profilePic });
  };

  // Handle account deletion button click
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Cancel account deletion
  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
  };

  return (
    <ProfileContainer>
      <Header>
        <IconButton onClick={handleNavigateBack} aria-label="Go back to settings">
          <ChevronLeftIcon />
        </IconButton>
        <SaveButton onClick={onSaveChanges} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </SaveButton>
      </Header>

      <ProfileImageWrapper>
        <ProfileImage image={profilePic} onClick={triggerFileInput} />
        <EditText>Click to edit</EditText>
        <HiddenFileInput
          type="file"
          accept="image/*"
          onChange={handleProfilePicSelect}
          ref={fileInputRef}
        />
      </ProfileImageWrapper>

      <InputField>
        <Input
          name="firstName"
          label="First Name"
          type="text"
          color="#A855F7"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
        />
      </InputField>

      <DeleteButton onClick={handleDeleteAccount}>Delete Account</DeleteButton>

      {showDeleteModal && (
        <DeleteModal
          onCancel={cancelDeleteAccount}
          onConfirm={confirmDeleteAccount}
          title="Delete Your Account"
          message="Are you sure you want to delete your account? This action cannot be undone."
        />
      )}
    </ProfileContainer>
  );
};

export default ProfileView;
