import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';
import Card3D from './Card3D';

const QuestionCard = ({
    question,
    options,
    onAnswer,
    onBack,
    currentProgress,
    currentIndex,
    totalQuestions
}) => {
    const [selectedIdx, setSelectedIdx] = useState(null);

    const handleSelect = (value, index) => {
        setSelectedIdx(index);
        setTimeout(() => {
            onAnswer(value);
            setSelectedIdx(null);
        }, 600);
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center px-6 relative">
            <div className="w-full max-w-4xl">
                <div className="mb-12 flex items-center justify-between">
                    <motion.button
                        whileHover={{ x: -4, backgroundColor: "rgba(255,255,255,0.7)" }}
                        onClick={onBack}
                        className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all group p-2 px-6 rounded-full bg-white/30 backdrop-blur-md border border-white/40"
                    >
                        <ArrowLeft className="h-3 w-3 transition-transform" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Previous</span>
                    </motion.button>
                    <div className="text-right space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#7C9885] block">Syncing Rhythm</span>
                        <div className="text-sm font-bold text-[#2D3142] font-mono tracking-tighter">
                            {currentIndex + 1} <span className="text-[#4A4E69]/20 mx-1">/</span> {totalQuestions}
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="h-1 w-full bg-[#7C9885]/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${currentProgress}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="h-full bg-[#7C9885] rounded-full shadow-[0_0_20px_rgba(124,152,133,0.3)]"
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, rotateY: 20, scale: 0.95 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: -20, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <Card3D>
                            <div className="relative bg-white/[0.03] backdrop-blur-[120px] rounded-[4rem] p-12 md:p-20 border border-white/20 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] overflow-hidden">
                                {/* Sub-pixel Grain & Glow */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
                                <div className="absolute -inset-px bg-gradient-to-br from-white/30 to-transparent opacity-20 pointer-events-none rounded-[4rem]" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-4xl md:text-6xl font-extrabold text-[#1D1F2D] mb-16 leading-[1.1] tracking-tighter"
                                    >
                                        {question.text}
                                    </motion.h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                                        {options.map((option, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + (index * 0.1) }}
                                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelect(option.value, index)}
                                                className={`w-full text-left p-8 rounded-[2.5rem] border transition-all duration-300 flex items-center justify-between group relative overflow-hidden backdrop-blur-md ${selectedIdx === index
                                                    ? 'bg-[#2D3142] border-[#2D3142] text-white shadow-2xl scale-[1.03]'
                                                    : 'bg-white/[0.05] border-white/10 text-[#2D3142] hover:border-white/40 shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-6 ${selectedIdx === index ? 'bg-white/10' : 'bg-white/20 shadow-inner'
                                                        }`}>
                                                        {option.emoji}
                                                    </div>
                                                    <span className="font-bold text-xl tracking-tight">{option.label}</span>
                                                </div>

                                                <div className="relative z-10">
                                                    {selectedIdx === index ? (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                                            <CheckCircle className="h-7 w-7 text-[#7C9885]" />
                                                        </motion.div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                            <ChevronRight className="h-6 w-6 text-[#7C9885]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card3D>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <motion.div
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="flex items-center justify-center gap-3"
                    >
                        <div className="w-1 h-1 rounded-full bg-[#7C9885]" />
                        <p className="text-[#4A4E69] text-[9px] font-bold uppercase tracking-[0.4em]">
                            Processing Sincere Response
                        </p>
                        <div className="w-1 h-1 rounded-full bg-[#7C9885]" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
