import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "../components/Header/Header";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../context/firebase/firebase";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

// ✅ Lazy load all pages
import Home from "../pages/Home";
const UnifiedAuth = lazy(() => import("../pages/UnifiedAuth"));
const Test = lazy(() => import("../pages/Test"));
const Community = lazy(() => import("../pages/Community"));
const Resources = lazy(() => import("../pages/Resources"));
const ChatWindow = lazy(() => import("../components/Chatbot/ChatWindow"));
const MoodDashboard = lazy(() => import("../pages/MoodTracker"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../pages/CookiePolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const MentalWellnessResources = lazy(() => import("../pages/WellnessResources"));

const MyChats = lazy(() => import("../pages/MyChats"));

const ViewRequests = lazy(() => import("../pages/ViewRequests"));
const SuggestedResources = lazy(() => import("../pages/SuggestedResources"));
const Founders = lazy(() => import("../pages/Founders"));
import AdminReportsPage from '../pages/AdminReportsPage';

const hideHeaderOnPaths = ["/auth"];

// ✅ Protected route wrapper for psychiatrists and doctors
const ProtectedPsychiatristRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  const psychiatristRoles = ['psychiatrist', 'doctor', 'company_doctor'];
  if (!psychiatristRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ✅ Protected route wrapper for members / students
const ProtectedStudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  const memberRoles = ['student', 'member', 'company_member'];
  if (!memberRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

// ✅ Protected route wrapper for all admin types
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  const adminRoles = ['admin', 'central_admin', 'overall_admin'];
  if (!adminRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Catch-all route for global redirects
  useEffect(() => {
    if (!checkingAuth && currentUser) {
      const adminAllowedPaths = ["/community", "/view-requests", "/admin-reports", "/auth", "/my-chats"];
      // Also restrict from root path /
      const isAdminRestricted = !adminAllowedPaths.includes(location.pathname) || location.pathname === "/";
      const isOverallAdmin = ['admin', 'central_admin', 'overall_admin'].includes(currentUser?.role);

      if (isOverallAdmin && isAdminRestricted) {
        console.log("🚫 Admin access restricted. Redirecting to /view-requests from:", location.pathname);
        navigate("/view-requests", { replace: true });
      }
    }
  }, [currentUser, location.pathname, checkingAuth, navigate]);

  return (
    <>
      {!hideHeaderOnPaths.includes(location.pathname) && <Header />}
      <main>
        {checkingAuth ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test" element={<Test />} />
              <Route path="/therapies" element={<MoodDashboard user={currentUser} />} />
              <Route path="/auth" element={<UnifiedAuth />} />

              <Route path="/community" element={<Community />} />
              <Route path="/resourcess" element={<Resources />} />
              <Route path="/resources" element={<MentalWellnessResources />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/admin-reports" element={<AdminReportsPage />} />
              <Route path="/founders" element={<Founders />} />
              <Route
                path="/my-chats"
                element={
                  currentUser ? <MyChats userId={currentUser.uid} /> : <Navigate to="/auth" replace />
                }
              />
              {/* Unified Hub Redirections */}
              <Route path="/psychiatrist" element={<Navigate to="/my-chats" replace />} />
              <Route path="/add-request" element={<Navigate to="/my-chats" replace />} />
              <Route
                path="/view-requests"
                element={
                  <ProtectedAdminRoute>
                    <ViewRequests />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ChatWindow
                    currentUser={currentUser}
                    checkingAuth={checkingAuth}
                    darkMode={darkMode}
                  />
                }
              />
              <Route path="/suggested-resources" element={<SuggestedResources />} />

              {/* Catch-all route for global redirects */}
              <Route path="*" element={<Navigate to={currentUser ? "/" : "/auth"} replace />} />
            </Routes>
          </Suspense>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;