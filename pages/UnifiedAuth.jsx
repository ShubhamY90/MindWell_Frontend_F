import { useState, useEffect } from 'react';
import {
    signInWithEmail,
    signInWithGoogle,
    auth,
    db
} from '../context/firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Brain, Lock, Mail, Eye, EyeOff, ArrowRight,
    Shield, ChevronRight,
    HeartPulse, User
} from 'lucide-react';

const WEAKNESS_QUOTES = [
    "Healing takes time, and asking for help is a courageous step.",
    "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity.",
    "Breathe. It's just a bad day, not a bad life.",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious."
];

export default function UnifiedAuth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [college, setCollege] = useState('NSUT');

    const navigate = useNavigate();
    const { user } = useAuth();

    // Role Redirection Logic
    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'admin':
            case 'central_admin':
            case 'overall_admin':
                navigate('/view-requests');
                break;
            case 'psychiatrist':
            case 'doctor':
            case 'company_doctor':
                navigate('/psychiatrist');
                break;
            case 'member':
            case 'company_member':
            case 'student':
            default:
                navigate('/');
                break;
        }
    };

    const [randomQuote, setRandomQuote] = useState('');
    const [quoteLoading, setQuoteLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                // Keep the initial timeout very short (2s) so it falls back to native quotes instantly if the internet is slow
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch('https://dummyjson.com/quotes/random', {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    setRandomQuote(data.quote);
                } else {
                    throw new Error("Failed to fetch quote");
                }
            } catch (err) {
                // Fallback to static quotes if API is blocked, rate-limited, or slow
                setRandomQuote(WEAKNESS_QUOTES[Math.floor(Math.random() * WEAKNESS_QUOTES.length)]);
            } finally {
                setQuoteLoading(false);
            }
        };

        fetchQuote();
    }, []);

    useEffect(() => {
        if (user) {
            redirectBasedOnRole(user.role);
        }
    }, [user]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await signInWithGoogle();
            const fbUser = result.user;

            const userRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    email: fbUser.email,
                    name: fbUser.displayName,
                    college: college || "NSUT",
                    uid: fbUser.uid,
                    role: 'student', // Default role for new signups
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    provider: "google"
                });
            } else {
                await updateDoc(userRef, {
                    lastLogin: new Date()
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                if (!name) throw new Error('Please enter your name');
                if (!email || !password || !confirmPassword) throw new Error('Please fill in all fields');
                if (password !== confirmPassword) throw new Error('Passwords do not match');

                const { createUserWithEmailAndPassword } = await import('firebase/auth');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name,
                    email,
                    college: college || 'NSUT',
                    uid: userCredential.user.uid,
                    role: 'student',
                    provider: "email",
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } else {
                if (!email || !password) throw new Error('Please fill in all fields');
                await signInWithEmail(email, password);
            }
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

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        },
        exit: {
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9FBFF] overflow-hidden relative selection:bg-[#7C9885]/30">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-transparent rounded-full blur-[120px]" />
                <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -60, 0], y: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-15%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9FBFF]/40 to-[#F9FBFF]" />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between p-6 lg:p-8 min-h-screen gap-8 lg:gap-16">

                {/* LEFT SIDE: Brand & Quote (Desktop Only) */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center items-start text-left"
                >
                    <div className="mb-8 relative group">
                        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="inline-flex items-center justify-center w-20 h-20 bg-[#2D3142] rounded-[1.75rem] shadow-2xl relative z-10">
                            <Brain className="w-10 h-10 text-white group-hover:animate-pulse" />
                        </motion.div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#7C9885]/30 blur-2xl rounded-full z-0"></div>
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-extrabold text-[#2D3142] mb-6 tracking-tighter leading-tight drop-shadow-sm">
                        {isForgotPassword ? 'Restore' : isSignUp ? 'Begin' : 'Welcome'}
                        <br />
                        <span className="text-[#7C9885] italic font-serif opacity-90">
                            {isForgotPassword ? 'Access' : isSignUp ? 'Journey' : 'Back'}
                        </span>
                    </h1>

                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl max-w-lg mt-4 relative group min-h-[140px] flex items-center">
                        <div className="absolute -top-6 -left-4 text-7xl text-[#7C9885]/20 leading-none font-serif select-none">"</div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={randomQuote || 'loading'}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className={`text-[#4A4E69] text-lg font-medium italic leading-relaxed z-10 relative ${quoteLoading ? 'animate-pulse blur-[2px]' : ''}`}
                            >
                                {randomQuote || "Breathing space..."}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap justify-start gap-4 mt-12 opacity-40">
                        <Badge icon={<ShieldCheck className="w-4 h-4 text-[#7C9885]" />} text="Protocol Sec" />
                        <Badge icon={<HeartPulse className="w-4 h-4 text-[#7C9885]" />} text="Pulse Encr" />
                        <Badge icon={<Sparkles className="w-4 h-4 text-[#7C9885]" />} text="AI Compliant" />
                    </div>
                </motion.div>

                {/* RIGHT SIDE: Auth Form Container */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-md lg:w-[420px]"
                >
                    <div className="bg-white/30 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/5 opacity-50 pointer-events-none" />
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isForgotPassword ? 'forgot' : isSignUp ? 'signup' : 'signin'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {/* Brand / Header (Mobile Only) */}
                                <div className="lg:hidden text-center mb-8">
                                    <motion.div
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                        className="inline-flex items-center justify-center w-14 h-14 bg-[#2D3142] rounded-[1.25rem] shadow-xl mb-4 group"
                                    >
                                        <Brain className="w-7 h-7 text-white group-hover:animate-pulse" />
                                    </motion.div>
                                    <h1 className="text-3xl font-bold text-[#2D3142] mb-2 tracking-tighter leading-tight">
                                        {isForgotPassword ? 'Restore Access' : isSignUp ? 'Begin Journey' : 'Reconnect'}
                                    </h1>
                                    <p className="text-[#4A4E69]/60 text-sm font-light">
                                        {isForgotPassword ? 'Reset your secure gateway' : isSignUp ? 'Join our ecosystem' : 'Return to your sanctuary'}
                                    </p>
                                </div>

                                {/* Form Header (Desktop Only) */}
                                <div className="hidden lg:block text-center lg:text-left mb-6">
                                    <h2 className="text-2xl font-bold text-[#2D3142] tracking-tight">
                                        {isForgotPassword ? 'Account Recovery' : isSignUp ? 'Create Credentials' : 'Authenticate'}
                                    </h2>
                                    <p className="text-[#4A4E69]/50 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                                        Secure Gateway
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-8 p-5 bg-rose-50/50 backdrop-blur-md border border-rose-100/50 rounded-2xl flex items-center gap-4 border-l-4 border-l-rose-400"
                                    >
                                        <Shield className="w-5 h-5 text-rose-500 shrink-0" />
                                        <p className="text-rose-700 text-sm font-semibold leading-snug">{error}</p>
                                    </motion.div>
                                )}

                                {resetSent ? (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-[#7C9885]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Mail className="w-8 h-8 text-[#7C9885]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#2D3142] mb-2 tracking-tight">Transmission Sent</h3>
                                        <p className="text-[#4A4E69]/60 mb-6 font-light italic">"{email}" is awaiting your command. Check your inbox and spam folder.</p>
                                        <button
                                            onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                                            className="text-[#2D3142] font-bold text-[11px] uppercase tracking-[0.2em] hover:text-[#7C9885] transition-colors"
                                        >
                                            Back to Entry
                                        </button>
                                    </div>
                                ) : isForgotPassword ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }} className="space-y-5">
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Secure Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-2xl py-3.5 pl-12 pr-5 text-[13px] text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 focus:shadow-[0_10px_40px_-15px_rgba(124,152,133,0.15)] outline-none transition-all font-medium"
                                                    placeholder="Enter verified email"
                                                />
                                            </div>
                                        </motion.div>
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            onClick={handlePasswordReset}
                                            className="w-full bg-[#2D3142] text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#4A4E69] transition-all flex items-center justify-center gap-3 group"
                                        >
                                            Dispatch Recovery
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
                                            <button onClick={() => setIsForgotPassword(false)} className="text-[#4A4E69]/40 font-bold text-[9px] uppercase tracking-[0.3em] hover:text-[#2D3142] transition-colors">
                                                Cancel Reset
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                                        {isSignUp && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-2"
                                            >
                                                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Identity</label>
                                                <div className="relative group">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-6 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                        placeholder="Full Name"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Credentials</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[1.25rem] py-5 pl-14 pr-6 text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                    placeholder="Email Address"
                                                />
                                            </div>
                                        </div>

                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Pass-Key</label>
                                                {!isSignUp && (
                                                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#7C9885] hover:text-[#8BA894] transition-colors">
                                                        Forgot?
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-2xl py-3 md:py-3.5 pl-12 pr-12 text-[13px] text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A4E69]/20 hover:text-[#2D3142] transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {isSignUp && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-1.5"
                                            >
                                                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Confirm Pass-Key</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4E69]/20 group-focus-within:text-[#7C9885] transition-colors" />
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-2xl py-3 md:py-3.5 pl-12 pr-12 text-[13px] text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white/80 focus:border-[#7C9885]/30 outline-none transition-all font-medium"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4A4E69]/20 hover:text-[#2D3142] transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#2D3142] text-white py-4 md:py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#4A4E69] hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-6 md:mt-8"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {isSignUp ? 'Initiate Session' : 'Authenticate Entry'}
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </motion.button>

                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative my-6 md:my-8 flex items-center gap-4">
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#4A4E69]/10 to-transparent" />
                                            <span className="text-[#4A4E69]/30 text-[8px] font-bold tracking-[0.4em] uppercase">Connect With</span>
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#4A4E69]/10 to-transparent" />
                                        </motion.div>

                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                            type="button"
                                            whileHover={{ y: -2 }}
                                            onClick={handleGoogleSignIn}
                                            className="w-full bg-white/20 border border-white/60 backdrop-blur-md py-4 rounded-2xl font-bold text-[#2D3142] text-[10px] uppercase tracking-[0.2em] hover:bg-white/40 hover:border-white transition-all flex items-center justify-center gap-3 shadow-sm"
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 opacity-80" alt="Google" />
                                            Global Sync
                                        </motion.button>

                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center mt-6 md:mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setIsSignUp(!isSignUp)}
                                                className="text-[#4A4E69]/40 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-[#2D3142] transition-colors"
                                            >
                                                {isSignUp ? (
                                                    <>Established <span className="text-[#7C9885] ml-1">Sign In</span></>
                                                ) : (
                                                    <>New Identity <span className="text-[#7C9885] ml-1">Join Now</span></>
                                                )}
                                            </button>
                                        </motion.div>
                                    </form>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}

function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function Sparkles(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function Badge({ icon, text }) {
    return (
        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2D3142]/60">
            {icon}
            {text}
        </div>
    );
}
