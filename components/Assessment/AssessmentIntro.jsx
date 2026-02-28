import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Shield, Waves, Battery, Zap, Brain } from 'lucide-react';

const moodOptions = [
    { id: 'happy', icon: <Sparkles className="h-6 w-6" />, label: "Radiant", description: "Joyful and full of vitality", color: "bg-yellow-50", textColor: "text-yellow-700", iconBg: "bg-yellow-100" },
    { id: 'anxiety', icon: <Waves className="h-6 w-6" />, label: "Restless", description: "Wavering or on several edges", color: "bg-purple-50", textColor: "text-purple-700", iconBg: "bg-purple-100" },
    { id: 'stress', icon: <Zap className="h-6 w-6" />, label: "Tense", description: "Heavy under pressure", color: "bg-orange-50", textColor: "text-orange-700", iconBg: "bg-orange-100" },
    { id: 'low', icon: <Battery className="h-6 w-6" />, label: "Quiet", description: "Withdrawn or low energy", color: "bg-blue-50", textColor: "text-blue-700", iconBg: "bg-blue-100" },
    { id: 'sad', icon: <Heart className="h-6 w-6" />, label: "Melancholy", description: "Reflective and soft", color: "bg-rose-50", textColor: "text-rose-700", iconBg: "bg-rose-100" }
];

const AssessmentIntro = ({ onSelectMood, onBack }) => {
    return (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-16 space-y-6"
            >
                <motion.button
                    whileHover={{ x: -4, backgroundColor: "rgba(255,255,255,0.7)" }}
                    onClick={onBack}
                    className="inline-flex items-center gap-3 text-[#4A4E69]/40 hover:text-[#2D3142] transition-all mb-4 group p-2 px-6 rounded-full bg-white/30 backdrop-blur-md border border-white/40"
                >
                    <ArrowLeft className="h-3 w-3 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Return</span>
                </motion.button>

                <h1 className="text-5xl md:text-7xl font-bold text-[#2D3142] tracking-tighter leading-none max-w-4xl mx-auto">
                    How is your <br /> <span className="text-[#7C9885]">inner rhythm</span>?
                </h1>
                <p className="text-lg md:text-xl text-[#4A4E69]/40 max-w-lg mx-auto font-light leading-relaxed">
                    Honesty is the threshold of peace. Select the energy that resonates most.
                </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6 max-w-6xl w-full">
                {moodOptions.map((mood, index) => (
                    <motion.button
                        key={mood.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 80,
                            damping: 12
                        }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectMood(mood.id)}
                        className="group relative flex flex-col items-center p-8 bg-white/50 backdrop-blur-[60px] rounded-[3rem] border border-white/60 shadow-[0_30px_60px_-15px_rgba(74,78,105,0.08)] hover:shadow-2xl transition-all duration-500 overflow-hidden w-full md:w-[200px]"
                    >
                        {/* Sub-pixel Glow Effect */}
                        <div className="absolute -inset-px bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />

                        <div className={`w-16 h-16 rounded-2xl ${mood.iconBg} flex items-center justify-center text-[#2D3142] mb-6 shadow-lg transition-transform duration-500 group-hover:rotate-6`}>
                            {mood.icon}
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3142] mb-2 tracking-tight">{mood.label}</h3>
                        <p className="text-[#4A4E69]/40 text-[9px] font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                            {mood.description}
                        </p>
                    </motion.button>
                ))}
            </div>

            <div className="flex items-center gap-10 opacity-20 mt-20">
                <div className="flex items-center gap-2">
                    <Shield size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Private Protocol</span>
                </div>
                <div className="w-1 h-1 bg-[#4A4E69]/40 rounded-full" />
                <div className="flex items-center gap-2">
                    <Brain size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Adaptive Analysis</span>
                </div>
            </div>
        </div>
    );
};

export default AssessmentIntro;