import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ListChecks, MessageSquare, ArrowLeft } from 'lucide-react';
import Card3D from './Card3D';

const InsightCard = ({ title, icon, items, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white/40 backdrop-blur-[40px] rounded-[3rem] p-10 md:p-12 border border-white/60 shadow-[0_30px_60px_-15px_rgba(74,78,105,0.1)] h-full flex flex-col group overflow-hidden"
    >
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

        <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-white rounded-2xl text-[#7C9885] shadow-xl group-hover:rotate-6 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-[10px] font-bold text-[#2D3142] uppercase tracking-[0.4em]">{title}</h3>
        </div>

        <ul className="space-y-6 flex-1">
            {items.map((item, idx) => (
                <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.3 + (idx * 0.1) }}
                    className="flex gap-4 text-lg text-[#4A4E69]/80 font-light leading-relaxed"
                >
                    <div className="h-6 w-6 rounded-full bg-[#7C9885]/10 flex-shrink-0 flex items-center justify-center mt-1">
                        <div className="h-1.5 w-1.5 bg-[#7C9885] rounded-full" />
                    </div>
                    {item}
                </motion.li>
            ))}
        </ul>
    </motion.div>
);

const DetailedAnalysis = ({ analysis, onBack }) => {
    if (!analysis) return null;

    return (
        <div className="w-full h-full flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-7xl">
                <div className="mb-8">
                    <motion.button
                        whileHover={{ x: -4, backgroundColor: "rgba(255,255,255,0.7)" }}
                        onClick={onBack}
                        className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all group p-2 px-6 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
                    >
                        <ArrowLeft className="h-3 w-3 transition-transform" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Back to Hub</span>
                    </motion.button>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                >
                    <Card3D>
                        <div className="relative bg-white/50 backdrop-blur-[60px] rounded-[3.5rem] p-8 md:p-12 border border-white/60 shadow-[0_40px_80px_-20px_rgba(74,78,105,0.1)] overflow-hidden max-h-[85vh] flex flex-col">
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

                            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 shrink-0">
                                <div className="w-16 h-16 bg-[#2D3142] rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <MessageSquare size={32} />
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9FBFF] rounded-full border border-[#7C9885]/20 mb-2">
                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#7C9885]">AI Intelligence Layer</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-bold text-[#2D3142] tracking-tighter leading-tight">Your Mental <span className="text-[#7C9885]">Synthesis.</span></h2>
                                </div>
                            </div>

                            <div className="overflow-y-auto pr-4 custom-scrollbar space-y-10">
                                {(() => {
                                    const cleanText = (text) => text?.replace(/file:\/\/\/[^ "]+/g, '[Attachment]') || '';

                                    return (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="relative p-8 bg-white/30 rounded-3xl border border-white/60"
                                            >
                                                <p className="text-2xl md:text-3xl text-[#4A4E69] font-light leading-relaxed italic border-l-4 border-[#7C9885] pl-8 py-2">
                                                    "{cleanText(analysis.summary)}"
                                                </p>
                                            </motion.div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <InsightCard
                                                    title="Synthesized Insights"
                                                    icon={<Lightbulb size={20} />}
                                                    items={analysis.insights?.map(cleanText) || []}
                                                    delay={0.6}
                                                />
                                                <InsightCard
                                                    title="Proposed Protocol"
                                                    icon={<ListChecks size={20} />}
                                                    items={analysis.recommendations?.map(cleanText) || []}
                                                    delay={0.8}
                                                />
                                            </div>
                                        </>
                                    );
                                })()}

                                <div className="flex items-center justify-center gap-4 opacity-20 py-6">
                                    <div className="h-[1px] flex-1 bg-[#2D3142]/20" />
                                    <span className="text-[8px] font-bold uppercase tracking-[0.4em] font-mono text-[#2D3142]">Protocol 0.8.4 Fully Integrated</span>
                                    <div className="h-[1px] flex-1 bg-[#2D3142]/20" />
                                </div>
                            </div>
                        </div>
                    </Card3D>
                </motion.div>
            </div>
        </div>
    );
};

export default DetailedAnalysis;
