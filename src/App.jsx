import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "../components/Header/Header";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../context/firebase/firebase";
import "./App.css";

// ✅ Lazy load all pages
const Home = lazy(() => import("../pages/Home"));
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
const AddRequest = lazy(() => import("../pages/AddRequest"));
const ViewRequests = lazy(() => import("../pages/ViewRequests"));

// ✅ Protected route wrapper
const ProtectedPsychiatristRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("psy_token");

  if (!token) {
    return (
      <Navigate
        to="/psychiatrist-auth"
        state={{ from: location }}
        replace
      />
    );
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

  const hideHeaderOnPaths = ["/psychiatrist-auth"];

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
            <Route path="/psychiatrist" element={<PsychiatristDashboard />} />
            <Route path="/add-request" element={<AddRequest />} />
            <Route
              path="/view-requests"
              element={
                <ProtectedPsychiatristRoute>
                  <ViewRequests />
                </ProtectedPsychiatristRoute>
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