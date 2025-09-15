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
const Test = lazy(() => import("../pages/Test"));
const Auth = lazy(() => import("../pages/Auth"));
const Community = lazy(() => import("../pages/Community"));
const Resources = lazy(() => import("../pages/Resources"));
const ChatWindow = lazy(() => import("../components/Chatbot/ChatWindow"));
const MoodDashboard = lazy(() => import("../pages/MoodTracker"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../pages/CookiePolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const MentalWellnessResources = lazy(() => import("../pages/WellnessResources"));
const PsychiatristAuth = lazy(() => import("../pages/PsychiatristAuth"));
const PsychiatristDashboard = lazy(() => import("../pages/PsychiatristDashboard"));
const MyChats = lazy(() => import("../pages/MyChats"));
const AdminAuth = lazy(() => import("../pages/AdminAuth"));
const AddRequest = lazy(() => import("../pages/AddRequest"));
const ViewRequests = lazy(() => import("../pages/ViewRequests"));
import AdminReportsPage from '../pages/AdminReportsPage';

// ✅ Protected route wrapper for psychiatrists
const ProtectedPsychiatristRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🛡️ No user, redirecting to /psychiatrist-auth');
        navigate('/psychiatrist-auth', { state: { from: location } });
        return;
      }
      if (user.role !== 'psychiatrist') {
        console.log('🛡️ User role is not psychiatrist:', user.role, 'redirecting to /auth');
        navigate('/auth');
        return;
      }
      console.log('🛡️ User is psychiatrist, allowing access');
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'psychiatrist') {
    return null;
  }

  return children;
};

// ✅ Protected route wrapper for students
const ProtectedStudentRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { state: { from: location } });
        return;
      }
      if (user.role !== 'student') {
        navigate('/psychiatrist-auth');
        return;
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return children;
};

// ✅ Protected route wrapper for admin users
const ProtectedAdminRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin-auth', { state: { from: location } });
        return;
      }
      if (user.role !== 'admin') {
        navigate('/admin-auth', { state: { from: location } });
        return;
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return children;
};

function AppShell() {
  const location = useLocation();
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

  // Add "/psychiatrist" to the array to hide header on psychiatrist dashboard
  const hideHeaderOnPaths = ["/psychiatrist-auth", "/admin-auth", "/psychiatrist"];

  return (
    <>
      {!hideHeaderOnPaths.includes(location.pathname) && <Header />}
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/therapies" element={<MoodDashboard user={currentUser} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resourcess" element={<MentalWellnessResources />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/psychiatrist-auth" element={<PsychiatristAuth />} />
            <Route path="/admin-auth" element={<AdminAuth />} />
            <Route path="/admin-reports" element={<AdminReportsPage />} />
            <Route 
              path="/psychiatrist" 
              element={
                <ProtectedPsychiatristRoute>
                  <PsychiatristDashboard />
                </ProtectedPsychiatristRoute>
              } 
            />
            <Route 
              path="/add-request" 
              element={
                <ProtectedStudentRoute>
                  <AddRequest />
                </ProtectedStudentRoute>
              } 
            />
            <Route 
              path="/my-chats" 
              element={
                <ProtectedStudentRoute>
                  <MyChats userId={currentUser?.email} />
                </ProtectedStudentRoute>
              } 
            />
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
          </Routes>
        </Suspense>
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