import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const MoodHero = ({ streak = 12 }) => {
    return (
        <div className="relative w-full h-[280px] overflow-hidden rounded-[2.5rem] bg-white border border-[#2D3142]/5 shadow-[0_4px_20px_-5px_rgba(45,49,66,0.05)] flex items-center">
            {/* Professional Hero Image - Right Aligned Glow */}
            <div className="absolute right-0 top-0 bottom-0 w-2/3 z-0">
                <img
                    src="/moodtracker_hero_premium.png"
                    alt="Sanctuary"
                    className="w-full h-full object-cover filter brightness-[0.98] contrast-[0.9] opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
            </div>

            <div className="relative z-10 w-full px-12 md:px-20 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#7C9885]/10 rounded-full border border-[#7C9885]/20 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C9885]" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2D3142]">Therapeutic Workspace</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-extrabold text-[#1D1F2D] leading-[1.1] tracking-tighter"
                    >
                        Cultivate Your <span className="text-[#7C9885]">Balance.</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-base text-[#4A4E69] font-semibold max-w-sm leading-relaxed opacity-80"
                    >
                        A professional space for mindful reflection and emotional growth.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="hidden md:flex justify-end items-center"
                >
                    <div className="flex items-center gap-6 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-[#F9FBFF] border border-[#2D3142]/5 flex items-center justify-center text-3xl shadow-inner">
                            🌱
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A4E69]/60">Mindful Streak</span>
                            <span className="text-3xl font-extrabold text-[#1D1F2D] tracking-tighter">{streak} Days</span>
                            <span className="text-[10px] text-[#7C9885] font-extrabold uppercase tracking-wider">Growing Resilience</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MoodHero;
