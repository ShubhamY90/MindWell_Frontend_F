import React, { Suspense,useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Test from '../pages/Test'; 
import { Header } from '../components/Header/Header';
import Auth from '../pages/Auth'; 
import Community from '../pages/Community';  
import Resources from '../pages/Resources'; 
import ChatWindow  from '../components/Chatbot/ChatWindow';
import { onAuthStateChanged } from 'firebase/auth';
import MoodDashboard from '../pages/MoodTracker'
import { auth } from '../context/firebase/firebase';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import CookiePolicy from '../pages/CookiePolicy';
import {TermsOfService} from '../pages/TermsOfService';
import './App.css';
import MentalWellnessResources from '../pages/WellnessResources';
import AddRequest from '../pages/AddRequest';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-400 to-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="mt-4 text-lg font-medium animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  return (
    <Router>
      <Header />
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/therapies" element={<MoodDashboard user={currentUser} />} />
            <Route path='/auth' element={<Auth/>} />
            <Route path='/community' element={<Community/>} />
            <Route path="/resources" element={<Resources/>} />
            <Route path="/resourcess" element={<MentalWellnessResources/>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/add-request" element={<AddRequest />} />
            
            if (currentUser){currentUser && (
              <Route path="/chatbot" element={ <ChatWindow user={currentUser} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            )}
            else{
              <Route path="/auth" element={<Auth />} />
            }

          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default App;