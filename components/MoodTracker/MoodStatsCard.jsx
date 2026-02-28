import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, AlertCircle, Battery, Activity, Lock } from 'lucide-react';

const moodConfig = {
    happy: { color: 'bg-yellow-100', icon: '😄', name: 'Happy', glow: 'shadow-yellow-200/50', iconColor: 'text-yellow-600' },
    sad: { color: 'bg-blue-100', icon: '😢', name: 'Sad', glow: 'shadow-blue-200/50', iconColor: 'text-blue-600' },
    stress: { color: 'bg-orange-100', icon: '😫', name: 'Stressed', glow: 'shadow-orange-200/50', iconColor: 'text-orange-600' },
    anxious: { color: 'bg-purple-100', icon: '😰', name: 'Anxious', glow: 'shadow-purple-200/50', iconColor: 'text-purple-600' },
    lowEnergy: { color: 'bg-slate-100', icon: '😞', name: 'Low Energy', glow: 'shadow-slate-200/50', iconColor: 'text-slate-600' },
    neutral: { color: 'bg-gray-100', icon: '😐', name: 'Neutral', glow: 'shadow-gray-100/50', iconColor: 'text-gray-600' }
};

const MoodStatsCard = ({ moodData, latestMood, loading, user }) => {
    const calculateTrend = (moods) => {
        if (!moods || moods.length < 2) return 'stable';
        const activeMoods = moods.map(m => m.mood);
        const countHappy = activeMoods.filter(m => m === 'happy').length;
        if (countHappy >= 3) return 'improving';
        if (activeMoods.includes('stress') && activeMoods.indexOf('stress') > 3) return 'declining';
        return 'stable';
    };

    const trend = calculateTrend(moodData);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white/40 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/20 shadow-[0_30px_60px_-15px_rgba(74,78,105,0.1)] h-full overflow-hidden"
        >
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-[#F9FBFF] rounded-2xl text-[#7C9885] shadow-inner">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#2D3142]">Weekly Narrative</h2>
                            <p className="text-[#4A4E69]/40 text-[10px] font-bold uppercase tracking-[0.2em]">Emotional Intelligence</p>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <Zap className="h-5 w-5 text-[#7C9885] opacity-20" />
                    </div>
                </div>

                {!user ? (
                    <div className="relative space-y-12">
                        {/* Blur overlay */}
                        <div className="absolute -inset-4 z-20 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center rounded-[2.5rem]">
                            <div className="bg-white p-4 rounded-full shadow-lg mb-4 text-[#4A4E69]">
                                <Lock className="w-8 h-8" />
                            </div>
                            <p className="text-[#4A4E69] font-bold tracking-widest uppercase text-sm">Log in to view insights</p>
                        </div>

                        {/* Garbage data */}
                        <div className="grid grid-cols-7 gap-3 md:gap-4 opacity-40 blur-[4px]">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-4">
                                    <div className="w-full aspect-square rounded-[1.5rem] bg-gray-100 flex items-center justify-center text-2xl shadow-sm">
                                        😐
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] font-bold text-[#2D3142]/30 uppercase tracking-tighter mb-1">DAY</div>
                                        <div className="text-sm font-bold text-[#2D3142]">0</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Garbage narrative */}
                        <div className="p-8 rounded-[2rem] bg-[#F9FBFF]/60 border border-white/40 shadow-xl relative overflow-hidden opacity-40 blur-[4px]">
                            <div className="relative z-10 space-y-3">
                                <p className="text-xl font-extrabold text-[#1D1F2D] leading-relaxed">
                                    Your flow is <span className="text-[#7C9885] italic">steady and centered.</span>
                                </p>
                                <p className="text-sm text-[#4A4E69] leading-relaxed font-bold opacity-90">
                                    Unlock personalized emotional intelligence tracking to understand your unique journey.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="rounded-full h-10 w-10 border-4 border-[#7C9885]/10 border-t-[#7C9885]"
                        />
                        <span className="text-[#4A4E69]/40 text-xs font-bold uppercase tracking-wider">Syncing your soul...</span>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid grid-cols-7 gap-3 md:gap-4">
                            {moodData.map((day, index) => {
                                const date = new Date(day.date);
                                const config = moodConfig[day.mood] || moodConfig.neutral;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.1) }}
                                        className="flex flex-col items-center gap-4 group"
                                    >
                                        <div className={`relative w-full aspect-square rounded-[1.5rem] ${config.color} flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 shadow-lg ${config.glow}`}>
                                            <span className="group-hover:rotate-12 transition-transform duration-500">{config.icon}</span>
                                            {day.isToday && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#7C9885] rounded-full ring-2 ring-white shadow-md" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[9px] font-bold text-[#2D3142]/30 uppercase tracking-tighter mb-1">
                                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className="text-sm font-bold text-[#2D3142]">{date.getDate()}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="p-8 rounded-[2rem] bg-[#F9FBFF]/60 border border-white/40 shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="text-[10px] font-extrabold text-[#1D1F2D] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#7C9885]" />
                                    Internal Sync
                                </h3>

                                {(() => {
                                    // Safety: Filter out local resource paths from any dynamic content
                                    const cleanText = (text) => text?.replace(/file:\/\/\/[^ "]+/g, '[Attachment]') || '';

                                    if (trend === 'improving') {
                                        return (
                                            <div className="space-y-3">
                                                <p className="text-xl font-extrabold text-[#1D1F2D] leading-relaxed">
                                                    Your spirit is <span className="text-[#7C9885]">lifting consistently.</span>
                                                </p>
                                                <p className="text-sm text-[#4A4E69] leading-relaxed font-bold opacity-90">
                                                    {cleanText("The upward curve in your emotional energy suggests a deepening of self-awareness. Keep nurturing this light.")}
                                                </p>
                                            </div>
                                        );
                                    } else if (trend === 'declining') {
                                        return (
                                            <div className="space-y-3">
                                                <p className="text-xl font-extrabold text-[#1D1F2D] leading-relaxed">
                                                    I notice some <span className="text-rose-500 italic">heaviness</span> recently.
                                                </p>
                                                <p className="text-sm text-[#4A4E69] leading-relaxed font-bold opacity-90">
                                                    {cleanText("Remember, every storm is a guest. Be gentle with your thoughts today; you are exactly where you need to be.")}
                                                </p>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="space-y-3">
                                                <p className="text-xl font-extrabold text-[#1D1F2D] leading-relaxed">
                                                    Your flow is <span className="text-[#7C9885] italic">steady and centered.</span>
                                                </p>
                                                <p className="text-sm text-[#4A4E69] leading-relaxed font-bold opacity-90">
                                                    {cleanText("Like a calm lake, this stability is a powerful foundation. You are cultivating a beautiful sense of inner resilience.")}
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MoodStatsCard;
