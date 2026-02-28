import { useState, useEffect } from 'react';
import { BrainCircuit, Stars, Atom, Satellite, ShieldHalf, LogIn, LogOut, Rocket, Menu, X } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { getAuth, signOut } from "firebase/auth";
import app from "../../context/firebase/firebase";
import { useAuth } from "../../src/hooks/useAuth";

export const Header = () => {
  const { user: currentUser } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = ['admin', 'central_admin', 'overall_admin'].includes(currentUser?.role);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      signOut(auth);
    } else {
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
        <motion.header
          initial={false}
          animate={{
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.15)",
            boxShadow: isScrolled ? "0 10px 30px -10px rgba(45, 49, 66, 0.1)" : "0 4px 20px -5px rgba(45, 49, 66, 0.02)",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="pointer-events-auto w-full max-w-5xl h-16 sm:h-20 backdrop-blur-3xl border border-white/20 rounded-[2rem] flex items-center overflow-hidden"
        >
          <div className="flex-1 px-6 sm:px-10 flex items-center justify-between">
            {/* Logo/Branding */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
              <div className="p-1.5 sm:p-2 bg-[#2D3142] rounded-xl shadow-md transition-transform group-hover:scale-110">
                <BrainCircuit className="h-4 w-4 sm:h-5 w-5 text-white" />
              </div>
              <h1 className="font-bold text-[#2D3142] tracking-tighter text-lg sm:text-xl">
                MindWell
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="flex items-center gap-1 px-4 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                <NavItem icon={Stars} label="AI Therapist" to="/chatbot" />
                <NavItem icon={Stars} label="My Chats" to="/my-chats" />
                <NavItem icon={Stars} label="Mood Tracker" to="/therapies" />
                <NavItem icon={Stars} label="Hive Network" to="/community" />
                <NavItem icon={Stars} label="Wellness Hub" to="/resources" />
                {/* <NavItem icon={Stars} label="Students" to="/psychiatrist" /> */}
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center">
                <button
                  onClick={handleAuthAction}
                  className="bg-[#2D3142] text-white text-[13px] font-bold px-6 py-2.5 rounded-2xl hover:bg-[#4A4E69] transition-all"
                >
                  {isLoggedIn ? "Logout" : "Login"}
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-2xl bg-[#2D3142]/5 hover:bg-[#2D3142]/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-[#2D3142]" />
                ) : (
                  <Menu className="h-6 w-6 text-[#2D3142]" />
                )}
              </button>
            </div>
          </div>
        </motion.header>
      </div>

      {/* Modern Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl" onClick={toggleMobileMenu} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 h-full w-[300px] bg-white shadow-2xl p-10 pt-24"
            >
              <button onClick={toggleMobileMenu} className="absolute top-8 right-8 p-2 rounded-2xl bg-gray-50">
                <X className="h-6 w-6 text-[#2D3142]" />
              </button>

              <div className="space-y-4">
                <MobileNavItem label="AI Therapist" to="/chatbot" onClick={toggleMobileMenu} />
                <MobileNavItem label="My Chats" to="/my-chats" onClick={toggleMobileMenu} />
                <MobileNavItem label="Mood Tracker" to="/therapies" onClick={toggleMobileMenu} />
                <MobileNavItem label="Hive Network" to="/community" onClick={toggleMobileMenu} />

                <div className="pt-10 border-t border-gray-100 mt-10">
                  <button
                    onClick={() => { handleAuthAction(); toggleMobileMenu(); }}
                    className="w-full bg-[#2D3142] text-white p-5 rounded-[1.25rem] font-bold shadow-lg"
                  >
                    {isLoggedIn ? "Logout Account" : "Get Started"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

const NavItem = ({ label, to }) => (
  <Link
    to={to}
    className="relative group px-4 py-2 text-[#4A4E69] hover:text-[#2D3142] text-[13px] font-semibold transition-all duration-300"
  >
    <span>{label}</span>
    <span className="absolute bottom-1 left-4 right-4 h-[1.5px] bg-[#2D3142] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
  </Link>
);

const MobileNavItem = ({ label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block w-full text-left p-4 rounded-3xl text-[#4A4E69] hover:text-[#2D3142] hover:bg-gray-50 text-base font-bold transition-all"
  >
    {label}
  </Link>
);

export default Header;