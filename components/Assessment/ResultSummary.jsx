import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Layout, ArrowRight, CheckCircle2, Waves, Sparkles, Brain, Shield } from 'lucide-react';
import Card3D from "./Card3D";

const ResultSummary = ({ result, selectedMood, onReset, onAnalyze }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl" // Added max-w-4xl to maintain original width constraint
            >
                <Card3D>
                    <div className="relative bg-white/50 backdrop-blur-[60px] rounded-[3.5rem] p-10 md:p-16 border border-white/60 shadow-[0_40px_80px_-20px_rgba(74,78,105,0.1)] overflow-hidden">
                        {/* Glow & Texture */}
                        <div className={`absolute - top - 20 - right - 20 w - 80 h - 80 opacity - 20 blur - [100px] rounded - full bg - gradient - to - br ${result?.color || 'from-indigo-400 to-purple-500'} animate - pulse`} />
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="shrink-0 relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 bg-gradient-to-tr from-[#7C9885]/20 to-transparent rounded-full blur-xl"
                                />
                                <div className="w-40 h-40 bg-[#2D3142] rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-2xl relative z-10 border border-white/10">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 opacity-40">Intensity</span>
                                    <span className="text-5xl font-bold tracking-tighter">{result.level}</span>
                                </div>
                            </div>

                            <div className="text-center md:text-left flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F9FBFF] rounded-full border border-[#7C9885]/20 mb-6">
                                    <CheckCircle2 size={12} className="text-[#7C9885]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D3142]">Synthesis Complete</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-bold text-[#2D3142] tracking-tighter leading-none mb-6">
                                    Maintaining <span className="text-[#7C9885]">Equilibrium.</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-[#4A4E69]/60 font-light leading-relaxed mb-8 max-w-xl">
                                    {result.message || result.quote}
                                </p>

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <button
                                        onClick={onAnalyze}
                                        className="group px-8 py-4 bg-[#2D3142] text-white rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-[#4A4E69] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        <Layout size={18} className="group-hover:rotate-12 transition-transform" />
                                        Deep Dive Analysis
                                    </button>
                                    <button
                                        onClick={onReset}
                                        className="px-8 py-4 bg-white/50 text-[#4A4E69] rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:bg-white transition-all border border-white/60"
                                    >
                                        <RefreshCw size={18} />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card3D>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 text-center"
            >
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#4A4E69]/20">Protocol Concluded — Data Integrated</span>
            </motion.div>
        </div>
    );
};

export default ResultSummary;
