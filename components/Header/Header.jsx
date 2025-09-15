import { useState, useEffect } from 'react';
import { BrainCircuit, Stars, Atom, Satellite, ShieldHalf, LogIn, LogOut, Rocket, Menu, X } from "lucide-react";
import { Link } from 'react-router-dom';

import { getAuth, signOut } from "firebase/auth";
import app from "../../context/firebase/firebase";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      {/* Fixed positioning container with reduced top padding */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-2">
        <header 
          className={`
            w-full bg-gradient-to-r from-gray-900/95 via-purple-900/95 to-indigo-900/95 
            backdrop-blur-xl border border-indigo-400/20 shadow-2xl rounded-2xl
            transition-all duration-500 ease-out
            ${isScrolled ? 'max-w-4xl mx-auto shadow-indigo-500/20' : 'max-w-7xl mx-auto'}
            ${isScrolled ? 'py-2' : 'py-3'}
          `}
          style={{
            boxShadow: isScrolled 
              ? '0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 80px rgba(139, 92, 246, 0.15)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.1)'
          }}
        >
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              {/* Logo/Branding */}
              <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <div 
                    className={`
                      p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full 
                      transition-all duration-300 group-hover:scale-110
                      ${isScrolled ? 'shadow-lg shadow-indigo-500/30' : 'shadow-xl shadow-indigo-500/40'}
                    `}
                  >
                    <BrainCircuit
                      className={`text-white transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`}
                      style={{ animation: "spin 8s linear infinite" }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-md"></div>
                </div>
                <h1 
                  className={`
                    font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 
                    bg-clip-text text-transparent tracking-tight transition-all duration-300
                    ${isScrolled ? 'text-lg' : 'text-xl'}
                  `}
                >
                  MindWell
                </h1>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <div className="flex items-center gap-1 px-4 py-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                  <NavItem icon={Stars} label="24x7 Chat" to="/chatbot" />
                  <NavItem icon={Stars} label="My Chats" to="/my-chats" />
                  <NavItem icon={Stars} label="Mood Tracker" to="/therapies" />
                  <NavItem icon={Stars} label="Hive Network" to="/community" />
                  {/* <NavItem icon={Stars} label="Students" to="/psychiatrist" /> */}
                </div>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <ActionButton 
                    icon={isLoggedIn ? LogOut : LogIn} 
                    label={isLoggedIn ? "Logout" : "Login"} 
                    variant="pink"
                    onClick={handleAuthAction}
                    isScrolled={isScrolled}
                  />
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-4 w-4 text-white" />
                  ) : (
                    <Menu className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Animated Glow Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className="absolute top-0 left-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-24 h-24 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent blur-sm"></div>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-16 left-4 right-4 bg-gradient-to-b from-gray-900/95 to-purple-900/95 backdrop-blur-xl border border-indigo-400/20 rounded-2xl shadow-2xl p-4">
            <div className="space-y-2">
              <MobileNavItem icon={Stars} label="Students" to="/psychiatrist" />
              <hr className="border-white/10" />
              <div onClick={handleAuthAction}>
                <MobileNavItem 
                  icon={isLoggedIn ? LogOut : LogIn} 
                  label={isLoggedIn ? "Logout" : "Login"} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

const NavItem = ({ icon: Icon, label, to }) => (
  <Link to={to} className="group relative px-3 py-1.5 rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-indigo-300 group-hover:text-white transition-colors" />
      <span className="text-xs font-medium text-indigo-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
  </Link>
);

const ActionButton = ({ icon: Icon, label, variant, onClick, isScrolled }) => {
  const variants = {
    indigo: "from-indigo-600 to-purple-600 hover:shadow-indigo-500/40",
    pink: "from-pink-600 to-rose-600 hover:shadow-pink-500/40",
    cyan: "from-blue-500 to-cyan-500 hover:shadow-cyan-500/40"
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-3 py-1.5 
        bg-gradient-to-r ${variants[variant]} text-white text-xs rounded-full 
        shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl
        ${isScrolled ? 'px-2.5 py-1 text-xs' : ''}
      `}
    >
      <Icon className={`transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
      <span className={`font-medium transition-all duration-300 ${isScrolled ? 'text-xs' : 'text-xs'}`}>
        {label}
      </span>
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

const MobileNavItem = ({ icon: Icon, label, to, onClick }) => (
  <Link to={to} onClick={onClick} className="w-full group flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-300">
    <div className="p-1.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
      <Icon className="h-4 w-4 text-indigo-300 group-hover:text-white transition-colors" />
    </div>
    <span className="text-indigo-300 group-hover:text-white font-medium text-sm transition-colors">
      {label}
    </span>
  </Link>
);

export default Header;