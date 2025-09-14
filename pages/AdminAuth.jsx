import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { API_BASE_URL } from '../src/utils/api';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'admin') {
      const from = location.state?.from?.pathname || '/view-requests';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Handle admin login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Use the login function from useAuth hook
      login({
        role: 'admin',
        name: data.user.name,
        email: data.user.email,
        token: data.token
      });
      
      // Get the redirect path from location state or default to view-requests
      const from = location.state?.from?.pathname || '/view-requests';
      navigate(from, { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-12 w-28 h-28 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-xl"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Admin Access 🔐</h1>
              <p className="text-white/90 text-sm">
                Secure administrative panel access
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Admin Email
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50/80 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:bg-white/90 transition-all duration-300 shadow-sm group-hover:shadow-md"
                    placeholder="Enter admin email"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Admin Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50/80 border-0 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:bg-white/90 transition-all duration-300 shadow-sm group-hover:shadow-md"
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500 hover:from-red-600 hover:via-orange-700 hover:to-yellow-600 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                
                {loading && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                )}
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Access Admin Panel
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl border-2 backdrop-blur-sm ${
                message.includes('success') || message.includes('Success')
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700' 
                  : 'bg-red-50/80 border-red-200 text-red-700'
              } transition-all duration-300`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    message.includes('success') || message.includes('Success') ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-8">
              <div className="p-4 bg-gradient-to-r from-red-50/60 via-orange-50/60 to-yellow-50/60 rounded-2xl border border-red-100/50 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Restricted administrative access</span>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Authorized personnel only 🔒
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Notice */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <span>Administrative Control</span>
              <span className="text-red-500">🛡️</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Secure access to platform management and oversight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
