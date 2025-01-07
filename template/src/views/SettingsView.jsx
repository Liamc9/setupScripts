// IMPORTS
import React from 'react';
import styled from 'styled-components';
import { StackedList } from 'liamc9npm';
import { Link } from "react-router-dom"; // Import Link for profile navigation
import { ChevronRightIcon } from 'liamc9npm';
import { useNavigate } from "react-router-dom";

// Styled Components
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Full height to position footer at the bottom */
  padding: 2rem; /* Increased padding for larger layout */
`;

const ProfileSection = styled(Link)`
  display: flex;
  align-items: center;
  padding: 24px; /* Increased padding */
  background-color: #ffffff; /* White background */
  border-radius: 0.5rem; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  text-decoration: none;
  color: inherit;
  margin-bottom: 2rem; /* Space below the profile section */
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ProfileImage = styled.div`
  width: 80px; /* Increased size */
  height: 80px; /* Increased size */
  border-radius: 50%;
  background-image: url(${(props) => props.image || "https://via.placeholder.com/80"});
  background-size: cover;
  background-position: center;
  margin-right: 24px; /* Increased margin */
`;

const ProfileInfo = styled.div`
  flex-grow: 1;
`;

const ProfileName = styled.div`
  font-size: 1.5rem; /* Larger font size */
  font-weight: bold;
  color: #333;
`;

const ViewProfile = styled.div`
  font-size: 1rem; /* Increased font size */
  color: #666;
`;

const IconWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;

  svg {
    width: 24px; /* Increased icon size */
    height: 24px;
    color: #666;
  }
`;

const LogoutButton = styled.button`
  background-color: #f3f4f6; /* Light gray */
  color: #dc2626; /* Red text */
  border: none;
  border-radius: 0.375rem; /* Rounded corners */
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 2rem;
  width: 100%; /* Full width */
  text-align: center;

  &:hover {
    background-color: #e5e7eb; /* Slightly darker gray */
  }
`;

const Footer = styled.footer`
  margin-top: auto; /* Push footer to the bottom */
  text-align: center;
  padding: 1.5rem 0; /* Increased padding */
  font-size: 1rem; /* Increased font size */
  color: #6b7280; /* Equivalent to text-gray-500 */
`;

const FooterLinks = styled.div`
  margin-top: 0.75rem; /* Increased margin */

  a {
    color: #2563eb; /* Equivalent to text-blue-600 */
    text-decoration: none;
    margin: 0 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;
const LoadingMessage = styled.div`
  padding: 16px;
  font-size: 1.25rem; /* Increased font size */
  color: #666;
  text-align: center;
`;

const SettingsView = ({ settings, logout, currentUser, userData }) => {
  // Group settings by category
  const navigate = useNavigate();

  const categories = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle loading and authentication state
  if (currentUser === null) {
    // User is not authenticated
    navigate("/login");
    return null;
  }

  if (!userData) {
    return <LoadingMessage>Loading user data...</LoadingMessage>;
  }

  return (
    <SettingsContainer>
      {/* Profile Section */}
      {userData && (
        <ProfileSection to={`/profile/${userData.id}`}>
          <ProfileImage image={userData.photoURL} />
          <ProfileInfo>
            <ProfileName>{userData.displayName || "User Name"}</ProfileName>
            <ViewProfile>View Profile</ViewProfile>
          </ProfileInfo>
          <IconWrapper>
            <ChevronRightIcon />
          </IconWrapper>
        </ProfileSection>
      )}

      {/* Grouped Categories */}
      {Object.keys(categories).map((category, index) => (
        <StackedList key={index} category={category} items={categories[category]} />
      ))}

      {/* Logout Button */}
      <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>

      {/* Footer */}
      <Footer>
        <div>Company Name</div>
        <div>Version 1.0.0</div>
        <FooterLinks>
          <a href="/terms">Terms</a>
          <a href="/policy">Policy</a>
        </FooterLinks>
      </Footer>
    </SettingsContainer>
  );
};

export default SettingsView;
