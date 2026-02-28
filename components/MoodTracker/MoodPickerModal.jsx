import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

const moodConfig = {
    happy: { color: 'bg-yellow-50', icon: '😄', name: 'Joyful', glow: 'shadow-yellow-100', hoverColor: 'hover:bg-yellow-100/50' },
    sad: { color: 'bg-blue-50', icon: '😢', name: 'Heavy', glow: 'shadow-blue-100', hoverColor: 'hover:bg-blue-100/50' },
    stress: { color: 'bg-orange-50', icon: '😫', name: 'Tense', glow: 'shadow-orange-100', hoverColor: 'hover:bg-orange-100/50' },
    anxious: { color: 'bg-purple-50', icon: '😰', name: 'Restless', glow: 'shadow-purple-100', hoverColor: 'hover:bg-purple-100/50' },
    lowEnergy: { color: 'bg-slate-50', icon: '😞', name: 'Drained', glow: 'shadow-slate-100', hoverColor: 'hover:bg-slate-100/50' },
    neutral: { color: 'bg-gray-50', icon: '😐', name: 'Still', glow: 'shadow-gray-100', hoverColor: 'hover:bg-gray-100/50' }
};

const MoodPickerModal = ({ isOpen, onClose, onLogMood, submitting }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [moodReason, setMoodReason] = useState('');

    const handleLog = async () => {
        if (!selectedMood) return;
        const success = await onLogMood(selectedMood, moodReason);
        if (success) {
            setSelectedMood(null);
            setMoodReason('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                {/* Deep Blur Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#2D3142]/40 backdrop-blur-[20px]"
                    onClick={onClose}
                />

                {/* Liquid Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 40 }}
                    className="relative w-full max-w-2xl bg-white/90 backdrop-blur-3xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(74,78,105,0.25)] overflow-hidden border border-white/60"
                >
                    {/* Animated Liquid Pulse */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C9885]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 animate-pulse" />

                    <div className="relative z-10 p-12 md:p-16">
                        <div className="flex justify-between items-start mb-16">
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F9FBFF] rounded-full border border-[#7C9885]/20"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C9885] animate-ping" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D3142]">Safe Space</span>
                                </motion.div>
                                <h3 className="text-4xl font-bold text-[#2D3142] tracking-tighter leading-none">
                                    What's moving <br /> through <span className="text-[#7C9885]">you?</span>
                                </h3>
                            </div>
                            <motion.button
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-4 rounded-3xl bg-[#F9FBFF] text-[#4A4E69]/40 hover:text-[#2D3142] transition-colors"
                            >
                                <X size={24} />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-16">
                            {Object.entries(moodConfig).map(([key, mood], idx) => (
                                <motion.button
                                    key={key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.05) }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative group ${selectedMood === key
                                        ? 'border-[#7C9885] bg-white shadow-2xl z-10'
                                        : `border-transparent bg-[#F9FBFF]/50 ${mood.hoverColor} hover:border-white`
                                        }`}
                                    onClick={() => setSelectedMood(key)}
                                >
                                    <div className={`w-20 h-20 rounded-3xl ${mood.color} flex items-center justify-center text-4xl mb-6 shadow-xl transition-transform duration-700 group-hover:rotate-6 ${selectedMood === key ? 'scale-110' : ''}`}>
                                        {mood.icon}
                                    </div>
                                    <span className={`text-[12px] font-bold uppercase tracking-[0.2em] ${selectedMood === key ? 'text-[#2D3142]' : 'text-[#4A4E69]/40 group-hover:text-[#4A4E69]'}`}>
                                        {mood.name}
                                    </span>
                                    {selectedMood === key && (
                                        <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-[#7C9885] mt-3" />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedMood && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="mb-16"
                                >
                                    <label className="block text-[10px] font-bold text-[#2D3142]/40 mb-6 uppercase tracking-[0.3em]">
                                        Context helps your narrative:
                                    </label>
                                    <textarea
                                        className="w-full px-8 py-6 rounded-3xl bg-[#F9FBFF] border-2 border-transparent focus:border-[#7C9885]/20 text-[#2D3142] placeholder-[#4A4E69]/20 focus:outline-none focus:ring-8 focus:ring-[#7C9885]/5 transition-all resize-none text-lg font-light leading-relaxed h-32"
                                        placeholder="Briefly describe the energy behind this feeling..."
                                        value={moodReason}
                                        onChange={(e) => setMoodReason(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ x: -4 }}
                                className="flex-1 px-8 py-6 text-xs font-bold text-[#4A4E69]/40 uppercase tracking-[0.2em] bg-[#F9FBFF] rounded-[1.5rem] hover:bg-white hover:text-[#4A4E69]/60 transition-all border border-transparent hover:border-white shadow-sm"
                                onClick={onClose}
                            >
                                Reflect Later
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-[2] px-8 py-6 text-xs font-bold text-white bg-[#2D3142] rounded-[1.5rem] hover:bg-[#4A4E69] transition-all shadow-[0_20px_40px_-10px_rgba(74,78,105,0.4)] flex items-center justify-center gap-3 ${!selectedMood || submitting ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                    }`}
                                onClick={handleLog}
                                disabled={!selectedMood || submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="uppercase tracking-[0.2em]">Archiving Breath...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="uppercase tracking-[0.2em]">Log this reflection</span>
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                                            <ChevronRight size={14} />
                                        </div>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MoodPickerModal;
