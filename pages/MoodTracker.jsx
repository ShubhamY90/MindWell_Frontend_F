import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodTracker } from '../components/MoodTracker/useMoodTracker';
import MoodHero from '../components/MoodTracker/MoodHero';
import MoodStatsCard from '../components/MoodTracker/MoodStatsCard';
import MoodActionCards from '../components/MoodTracker/MoodActionCards';
import MoodPickerModal from '../components/MoodTracker/MoodPickerModal';
const MoodDashboard = () => {
  const {
    moodData,
    latestTest,
    loading,
    todayMoodLogged,
    latestMood,
    logMood,
    submitting
  } = useMoodTracker();

  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const handleLogMood = async (selectedMood, moodReason) => {
    const success = await logMood(selectedMood, moodReason);
    if (success) {
      setShowMoodPicker(false);
    }
    return success;
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] relative flex flex-col">
      {/* Unified Dashboard Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/dashboard-bg.png"
          className="w-full h-full object-cover opacity-5 pointer-events-none"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F9FBFF] via-white/40 to-[#F9FBFF]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7C9885]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4A4E69]/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-10 pt-32 sm:pt-40 pb-12 flex flex-col gap-10">
        {/* Header/Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0"
        >
          <MoodHero />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 items-start">
          {/* Left Section: Stats & Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-12 xl:col-span-8 rounded-[2.5rem] h-full"
          >
            <MoodStatsCard
              moodData={moodData}
              latestMood={latestMood}
              loading={loading}
            />
          </motion.div>

          {/* Right Section: Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-12 xl:col-span-4 rounded-[2.5rem]"
          >
            <MoodActionCards
              showMoodLog={!todayMoodLogged}
              showTest={!latestTest || !latestTest.recent}
              showResources={todayMoodLogged && latestMood}
              onLogClick={() => setShowMoodPicker(true)}
              onTestClick={() => {/* Navigation handled in component */ }}
            />
          </motion.div>
        </div>
      </div>

      <MoodPickerModal
        isOpen={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onLogMood={handleLogMood}
        submitting={submitting}
      />
    </div>
  );
};

export default MoodDashboard;
