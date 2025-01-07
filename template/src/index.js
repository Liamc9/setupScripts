import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
} from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import useAuth
import Root from "./routes/Root";
import Login from "./routes/Login";
import Home from "./routes/Home";
import Search from "./routes/Search";
import SettingsPage from "./routes/Settings";
import ManageAccount from "./routes/ManageAccount";
import Profile from "./routes/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper component for route protection
const RequireAuth = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// ROUTES
const router = createBrowserRouter([
  {
    path: "",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      { path: "login", element: <Login /> },
      { path: "home", element: <Home /> },
      { path: "search", element: <Search /> },
      {
        path: "settings/:userId",
        element: (
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: "settings/manageaccount/:userId",
        element: (
          <RequireAuth>
            <ManageAccount />
          </RequireAuth>
        ),
      },
      { path: "profile/:userId", element: <Profile /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastContainer />
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
    <ToastContainer />
  </React.StrictMode>
);
