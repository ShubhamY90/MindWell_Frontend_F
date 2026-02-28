import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Search, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActionCard = ({ title, description, icon, onClick, bgColor, textColor, borderColor }) => (
    <motion.button
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full text-left p-8 rounded-[2rem] border ${borderColor} ${bgColor} flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-xl`}
    >
        <div className={`p-4 rounded-2xl w-fit ${textColor} bg-white/40 shadow-sm backdrop-blur-md mb-8 group-hover:rotate-6 transition-transform`}>
            {icon}
        </div>
        <div>
            <h3 className={`text-2xl font-extrabold text-[#1D1F2D] mb-3 tracking-tighter`}>{title}</h3>
            <p className={`text-[#4A4E69] font-medium leading-relaxed mb-6 opacity-80 text-base`}>{description}</p>
            <div className={`flex items-center gap-3 font-extrabold text-sm ${textColor}`}>
                <span className="uppercase tracking-widest">Interact</span>
                <div className={`w-8 h-8 rounded-full border-2 ${borderColor} flex items-center justify-center group-hover:bg-white transition-all`}>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </div>
    </motion.button>
);

const MoodActionCards = ({
    showMoodLog,
    showTest,
    showResources,
    onLogClick,
    onTestClick
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
                {showMoodLog && (
                    <motion.div
                        key="mood-log"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <ActionCard
                            title="Tell me about your day 🌅"
                            description="I'd love to hear how you're feeling right now. Your emotions matter, and sharing them helps me understand your unique journey."
                            icon={<Heart size={24} />}
                            onClick={onLogClick}
                            bgColor="bg-[#F9FBFF]"
                            textColor="text-[#7C9885]"
                            borderColor="border-[#7C9885]/20"
                        />
                    </motion.div>
                )}

                {showTest && (
                    <motion.div
                        key="deep-dive"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <ActionCard
                            title="Let's dive deeper together 🔍"
                            description="I'd love to understand you on a deeper level. Let's explore your emotional landscape with some gentle, science-backed questions."
                            icon={<Search size={24} />}
                            onClick={onTestClick}
                            bgColor="bg-[#1D1F2D]"
                            textColor="text-white/90"
                            borderColor="border-white/5"
                        />
                    </motion.div>
                )}

                {showResources && (
                    <motion.div
                        key="resources"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <ActionCard
                            title="I have something special for you ✨"
                            description="Based on our conversations, I've gathered some resources that I think will speak to your heart and help you grow."
                            icon={<Activity size={24} />}
                            onClick={() => navigate('/resources')}
                            bgColor="bg-white"
                            textColor="text-[#4A4E69]"
                            borderColor="border-[#4A4E69]/10"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default MoodActionCards;
