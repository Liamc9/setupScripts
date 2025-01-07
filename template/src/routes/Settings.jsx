// Settings.js
import React from "react";
import { useAuth } from "../context/AuthContext";
import SettingsView from "../views/SettingsView";
import { UsersIcon, NotificationsIcon } from "liamc9npm"; // Ensure Icons are imported

// CREATE FUNCTION
function Settings() {
  const { logout, userData, currentUser } = useAuth(); // Access userData and currentUser from context

  // HTML
  return (
    <div>
      <SettingsView
        userData={userData}
        logout={logout}
        currentUser={currentUser}
        settings={[
          {
            category: "Account",
            icon: UsersIcon,
            text: "Manage Account",
            link: "./manageaccount",
          },
          {
            category: "Communication",
            icon: NotificationsIcon,
            text: "Email Notifications",
            link: "/email-notifications",
          },
        ]}
      />
    </div>
  );
}

export default Settings;
