import { useState } from 'react';
import { 
  googleProvider,
  createUserWithEmail as createUser,
  signInWithEmail,
  signInWithGoogle
} from '../context/firebase/firebase';
import { auth, db } from '../context/firebase/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { User, Brain, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, Shield, GraduationCap } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');

  const navigate = useNavigate();

  const handleSignUp = async (email, password, name, college) => {
    try {
      const userCredential = await createUser(email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        college,
        userId: userCredential.user.uid,
        provider: "email",
        createdAt: new Date(),
        lastLogin: new Date()
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // For new users signing up with Google, use the college from state
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          college: college || "Not specified", // Use college from state or default
          userId: user.uid,
          createdAt: new Date(),
          lastLogin: new Date(),
          provider: "google"
        });
      } else {
        await updateDoc(userRef, {
          lastLogin: new Date()
        });
      }

      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name) throw new Error('Please enter your name');
        if (!college) throw new Error('Please enter your college name');
        if (!email || !password) throw new Error('Please fill in all fields');
        await handleSignUp(email, password, name, college);
      } else {
        if (!email || !password) throw new Error('Please fill in all fields');
        await signInWithEmail(email, password);
      }

      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 overflow-auto py-8 pt-24 relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
        {/* Floating Orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-200/40 to-indigo-300/40 blur-3xl animate-float"
          style={{
            left: '10%',
            top: '20%',
            animation: 'float 8s ease-in-out infinite 0s'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-3xl animate-float"
          style={{
            right: '15%',
            bottom: '25%',
            animation: 'float 10s ease-in-out infinite 2s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-teal-200/25 to-cyan-200/25 blur-3xl animate-float"
          style={{
            left: '60%',
            top: '10%',
            animation: 'float 12s ease-in-out infinite 4s'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse-slow" />
        
        {/* Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-twinkle shadow-sm"
            style={{
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/3 w-8 h-8 border border-indigo-200/60 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-gradient-to-r from-purple-300/50 to-pink-300/50 rounded-full animate-bounce-slow" />
        <div className="absolute top-1/2 left-1/5 w-4 h-12 bg-gradient-to-b from-blue-300/40 to-transparent rounded-full animate-sway" />
      </div>

      <div className="w-full max-w-md relative z-10 mx-4">
        {/* Main Login Card */}
        <div 
          className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-indigo-200/50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0px) scale(1)',
            boxShadow: isHovered ? '0 32px 64px -12px rgba(99, 102, 241, 0.2)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-purple-100/30 animate-pulse-slow" />
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-8 text-white">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isForgotPassword ? 'Account Recovery 🔐' : isSignUp ? 'Join MindWell 🌟' : 'Welcome Back! 💙'}
              </h1>
              <p className="text-white/90 text-sm">
                {isForgotPassword ? 'Restore access to your account' : 
                 isSignUp ? 'Start your mental wellness journey today' : 'Ready to continue your wellness journey?'}
              </p>
            </div>
          </div>
          
          {/* Form Area */}
          <div className="p-8 relative">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm backdrop-blur-sm animate-slade-in shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {error}
                </div>
              </div>
            )}
            
            {resetSent ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
                    <h3 className="font-medium mb-2">Reset Link Sent Successfully</h3>
                    <p className="text-sm text-green-600">Please check your email for further instructions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300 hover:glow-text"
                >
                  Return to Sign In
                </button>
              </div>
            ) : isForgotPassword ? (
              <div className="space-y-6 animate-slide-in">
                <div className="space-y-3">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-600 transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 w-full p-4 bg-white/60 border border-indigo-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/70 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                      placeholder="your@email.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                
                <button
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="text-indigo-600/80 hover:text-indigo-700 text-sm font-medium w-full text-center transition-colors duration-300"
                >
                  ← Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                {/* Name and College fields - only shown during sign up */}
                {isSignUp && (
                  <>
                    <div className="space-y-3">
                      <label className="block text-gray-700 text-sm font-medium tracking-wide">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-600 transition-colors duration-300" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-12 w-full p-4 bg-white/60 border border-indigo-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/70 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                          placeholder="Your name"
                          required={isSignUp}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-gray-700 text-sm font-medium tracking-wide">
                        College/University
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <GraduationCap className="h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-600 transition-colors duration-300" />
                        </div>
                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          className="pl-12 w-full p-4 bg-white/60 border border-indigo-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/70 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                          placeholder="Your college or university"
                          required={isSignUp}
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-3">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-600 transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 w-full p-4 bg-white/60 border border-indigo-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/70 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                      placeholder="your@email.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-gray-700 text-sm font-medium tracking-wide">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-600 transition-colors duration-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 w-full p-4 bg-white/60 border border-indigo-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/70 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:bg-white/80 shadow-sm"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center group"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-600 transition-colors duration-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-indigo-400/70 group-hover:text-indigo-600 transition-colors duration-300" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-100/20 to-purple-100/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
                
                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500/50 bg-white border-indigo-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-600 font-medium">
                        Remember me
                      </label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center group hover:shadow-lg hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                  <div className="relative flex items-center">
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isSignUp ? 'Creating Account...' : 'Signing in...'}
                      </div>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>

                {/* Divider */}
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-indigo-200/60"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-medium tracking-wide">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white/70 border border-indigo-200/60 p-4 rounded-2xl font-medium hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-3 group backdrop-blur-sm shadow-sm"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">G</span>
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    {loading ? 'Connecting...' : 'Continue with Google'}
                  </span>
                </button>
              </form>
            )}
            
            {!isForgotPassword && !resetSent && (
              <div className="mt-6 animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-indigo-200/60"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-medium tracking-wide">
                      {isSignUp ? 'Already have an account?' : 'New here?'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="mt-4 w-full border-2 border-indigo-400/60 text-indigo-600 p-4 rounded-2xl font-medium hover:bg-indigo-50/70 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm shadow-sm"
                >
                  <span className="group-hover:text-indigo-700 transition-colors duration-300">
                    {isSignUp ? 'Sign In Instead' : 'Create New Account'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
        
        .animate-sway {
          animation: sway 4s ease-in-out infinite;
        }
        
        .hover\\:glow-text:hover {
          text-shadow: 0 0 15px currentColor;
        }
      `}</style>
    </div>
  );
}