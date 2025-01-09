// src/routes/Root.js
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  HomeIcon3,
  SearchIcon2,
  UserIcon3,
} from "liamc9npm";
import { useNotifications } from "../context/NotificationContext";
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth functions
import { useAuth } from "../context/AuthContext"; // Import AuthContext for currentUser
import { TopWSideNav, BottomNav} from 'liamc9npm';


export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const { currentUser } = useAuth(); // Access currentUser from AuthContext

  // Scroll to top whenever the location.pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Helper function to check if a path matches the current route, including dynamic paths
  const matchesPath = (pathPattern) => {
    const regex = new RegExp(`^${pathPattern.replace(":id", "[^/]+")}$`);
    return regex.test(location.pathname);
  };

  // Paths where TopNavBar should be hidden
  const topNavHiddenPaths = [
    "/login",
    "/settings/:id",
    "/account/:id",
    "/profile/:id",
  ];

  // Paths where BottomNavBar should be hidden
  const bottomNavHiddenPaths = ["/login", "/rooms/:id", "/conversation/:id"];

  const shouldHideTopNav = () =>
    topNavHiddenPaths.some((path) => matchesPath(path));
  const shouldHideBottomNav = () =>
    bottomNavHiddenPaths.some((path) => matchesPath(path));

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

  // Dynamic bottom navigation items based on notification context and currentUser
  const bottomNavItems = [
    
    {
      text: "Home",
      icon: HomeIcon3,
      path: "/home",
      hasNotification: notifications.home,
    },
    {
      text: "Search",
      icon: SearchIcon2,
      path: "/search",
      hasNotification: notifications.search,
    },
    {
      text: "Account",
      icon: UserIcon3,
      path: currentUser ? `/account/${currentUser.uid}` : "/login", // Dynamic user ID path or login fallback
      hasNotification: notifications.account,
    },
  ];

  return (
    <div id="root" className="w-full overflow-x-hidden bg-white">
      {/* Top Navigation Bar */}
      {!shouldHideTopNav() && (
        <>
          {/* Mobile Top Navbar */}
          <div>
            <TopWSideNav
              appName="MyApp"
              signInColor="#000000"
              navLinks={[
                { name: "Home", path: "/home", Icon: HomeIcon3 },
                { name: "Search", path: "/search", Icon: SearchIcon2 },
                { name: "Account", path: "/account", Icon: UserIcon3 },
              ]}
              username={currentUser?.displayName || "Guest"}
              profilePic={
                currentUser?.photoURL || "https://via.placeholder.com/50"
              }
              onLogout={handleLogout} // Pass the Firebase logout function
            />
          </div>
          
        </>
      )}

      {/* Bottom Navigation Bar */}
      {!shouldHideBottomNav() && (
        <div className="md:hidden">
          <BottomNav items={bottomNavItems} activeColor="fff"/>
        </div>
      )}

      {/* Main Content with Conditional Margin */}
      <div className={!shouldHideBottomNav() ? "pb-16 md:pb-0" : ""}>
        <Outlet />
      </div>
    </div>
  );
}
