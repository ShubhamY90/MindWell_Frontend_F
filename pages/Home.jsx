import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import HomeImage from '../src/assets/HomeImage.png';
import {
  MessageCircle,
  Users,
  User,
  Brain,
  Heart,
  Smile,
  Activity,
  Calendar,
  ArrowRight,
  Shield,
  Clock,
  Stars,
  Atom,
  ShieldHalf,
  Rocket,
  Volume2,
  VolumeX,
  UserCheck,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

export default function Home() {
  const [userMood, setUserMood] = useState(null);
  const [showMoodTest, setShowMoodTest] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    // Use React state instead of localStorage for artifacts
    return false;
  });

  const navigate = useNavigate();

  const moodQuestions = [
    {
      question: "How would you describe your energy level today?",
      options: ["Very low", "Low", "Moderate", "High", "Very high"]
    },
    {
      question: "How well did you sleep last night?",
      options: ["Very poorly", "Poorly", "Okay", "Well", "Very well"]
    },
    {
      question: "How are you feeling about the day ahead?",
      options: ["Anxious", "Worried", "Neutral", "Optimistic", "Excited"]
    },
    {
      question: "How connected do you feel to others right now?",
      options: ["Very isolated", "Lonely", "Neutral", "Connected", "Very connected"]
    }
  ];

  const startMoodTest = () => {
    navigate("/test");
  };

  const handleChatNow = () => {
    navigate("/chatbot");
  };

  const handleConnectWithPsychiatrist = () => {
    navigate("/add-request");
  };

  const handleMoodAnswer = (answerIndex) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < moodQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate mood based on answers
      const averageScore = newAnswers.reduce((sum, answer) => sum + answer, 0) / newAnswers.length;
      let mood;
      if (averageScore <= 1) mood = "struggling";
      else if (averageScore <= 2) mood = "low";
      else if (averageScore <= 3) mood = "neutral";
      else if (averageScore <= 4) mood = "good";
      else mood = "great";

      setUserMood(mood);
      setShowMoodTest(false);
      setCurrentQuestion(0);
      setAnswers([]);
    }
  };

  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Optimized audio loading
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleCanPlay = () => {
        setAudioLoaded(true);
        audio.volume = 0.2;
        audio.muted = isMuted;
      };

      const handleError = (e) => {
        console.error("Audio loading error:", e);
        setAudioLoaded(false);
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      // Preload the audio
      audio.load();

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [isMuted]);

  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted && audioRef.current && !isMuted && audioLoaded) {
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playbook prevented:", error);
        });
      }
      setHasInteracted(true);
    }
  }, [hasInteracted, isMuted, audioLoaded]);

  useEffect(() => {
    const handleInteraction = () => {
      handleFirstInteraction();
    };

    if (audioLoaded) {
      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('touchstart', handleInteraction, { once: true });
    }

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [handleFirstInteraction, audioLoaded]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);

      if (!newMuted && audioLoaded) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playbook failed:", error);
          });
        }
      }
    }
  }, [audioLoaded]);

  return (
    <div className="min-h-screen bg-[#F9FBFF] text-[#2D3142] selection:bg-[#7C9885]/30">
      <audio
        ref={audioRef}
        src="/calm.mp3"
        loop
        preload="auto"
      />

      {/* Mood Test Modal - Framer Motion */}
      <AnimatePresence>
        {showMoodTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2D3142]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl border border-[#7C9885]/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142]">
                  Question {currentQuestion + 1}
                  <span className="text-[#7C9885] text-sm font-normal ml-2">of {moodQuestions.length}</span>
                </h3>
                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / moodQuestions.length) * 100}%` }}
                    className="h-full bg-[#7C9885]"
                  />
                </div>
              </div>

              <p className="text-lg text-[#4A4E69] mb-8 leading-relaxed">
                {moodQuestions[currentQuestion].question}
              </p>

              <div className="space-y-3">
                {moodQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoodAnswer(index)}
                    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-[#7C9885] hover:bg-[#F9FBFF] transition-all duration-300 group flex justify-between items-center"
                  >
                    <span className="text-[#2D3142] group-hover:text-[#4A4E69]">{option}</span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#7C9885] transition-colors" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowMoodTest(false)}
                className="mt-8 w-full text-gray-400 hover:text-[#4A4E69] text-sm font-medium transition-colors"
              >
                Cancel Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={HomeImage}
            alt="Mental wellness background"
            className="w-full h-full object-cover brightness-[0.85]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2D3142]/40 via-transparent to-[#F9FBFF]"></div>
        </div>

        {/* Particles Overlay */}
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            particles: {
              number: { value: 40, density: { enable: true, area: 800 } },
              color: { value: "#ffffff" },
              opacity: { value: 0.3, random: true },
              size: { value: { min: 1, max: 3 }, random: true },
              move: {
                enable: true,
                speed: 0.5,
                direction: "top",
                random: true,
                straight: false,
                outModes: "out"
              }
            },
            interactivity: { events: { onHover: { enable: false } } }
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-6">
            Your path to inner peace
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          >
            Nurture Your Mind, <br />
            <span className="text-[#C9E4CA]">Empower Your Soul</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-white/90 mb-10 leading-relaxed font-light"
          >
            A sanctuary for mental clarity. Explore personalized tools, mindful connections, and professional support tailored for your journey.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleChatNow}
              className="group bg-[#7C9885] hover:bg-[#8BA894] text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl shadow-[#7C9885]/20 flex items-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Wellness Chat
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={startMoodTest}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300"
            >
              Check My Mood
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-6 w-[1.5px] bg-gradient-to-b from-white to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        {/* Statistics/Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 p-12 rounded-[3rem] bg-white border border-[#7C9885]/10 shadow-[0_10px_50px_-15px_rgba(124,152,133,0.1)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C9885]/5 to-transparent rounded-[3rem] pointer-events-none" />
          {[
            { label: "Active Users", value: "10k+", color: "text-[#7C9885]" },
            { label: "Success Stories", value: "2.5k+", color: "text-[#4A4E69]" },
            { label: "Expert Partners", value: "150+", color: "text-[#7C9885]" },
            { label: "Mood Checks", value: "50k+", color: "text-[#4A4E69]" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className={`text-4xl font-bold ${stat.color} mb-1 transition-transform group-hover:scale-110 duration-500`}>{stat.value}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Bento Grid Features */}
        <section id="features" className="mb-48">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-[#2D3142] mb-6 leading-tight">Holistic Mental Support,<br />Redefined for You</h2>
              <p className="text-[#4A4E69] text-xl font-light leading-relaxed">
                Design your journey to wellness with our high-end therapeutic ecosystem.
              </p>
            </div>
            <Link to="/therapies" className="group flex items-center gap-3 text-[#7C9885] font-bold py-2 px-1">
              Explore All Tools
              <div className="w-10 h-10 rounded-full border border-[#7C9885]/20 flex items-center justify-center group-hover:bg-[#7C9885] group-hover:text-white transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
            {/* Main Feature - AI Therapist */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-8 md:row-span-2 bg-[#2D3142] rounded-[2.5rem] p-10 md:p-12 text-white relative overflow-hidden group shadow-2xl"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="max-w-md">
                  <div className="flex gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl w-fit group-hover:scale-110 transition-transform duration-500">
                      <BrainCircuit className="h-8 w-8 text-[#7C9885]" />
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-[#7C9885]/20 rounded-2xl border border-[#7C9885]/30">
                      <div className="w-2 h-2 bg-[#7C9885] rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#7C9885]">AI System Active</span>
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold mb-6 !leading-[1.2]">AI-Powered Personalized Therapy</h3>
                  <p className="text-white/60 text-lg font-light leading-relaxed">Our advanced AI mirrors clinical empathy, providing 24/7 support that evolves with your emotional needs through deep behavioral mapping.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button onClick={handleChatNow} className="bg-white text-[#2D3142] px-10 py-5 rounded-[1.25rem] font-bold w-full sm:w-fit hover:bg-[#7C9885] hover:text-white transition-all shadow-xl active:scale-95">
                    Begin Soul Talk
                  </button>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [12, 24, 12] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className="w-1 bg-white/20 rounded-full"
                      />
                    ))}
                    <span className="text-[10px] text-white/40 font-bold uppercase ml-2 tracking-tighter">Empathy Syncing</span>
                  </div>
                </div>
              </div>

              {/* Abstract Visual Elements */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C9885]/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-[#7C9885]/20 transition-all duration-1000" />
              <div className="absolute bottom-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Stars className="h-48 w-48 text-[#7C9885] rotate-12" />
              </div>
            </motion.div>

            {/* Feature 2 - Space for Community */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-4 md:row-span-1 bg-[#F9FBFF] rounded-[2.5rem] p-8 border border-[#7C9885]/10 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="bg-[#7C9885]/10 p-4 rounded-2xl text-[#7C9885] group-hover:rotate-6 transition-transform shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex -space-x-3">
                  {[
                    "bg-gradient-to-br from-blue-400 to-indigo-500",
                    "bg-gradient-to-br from-[#7C9885] to-[#8BA894]",
                    "bg-gradient-to-br from-indigo-300 to-purple-400",
                    "bg-white flex items-center justify-center text-[10px] font-bold text-[#7C9885]"
                  ].map((style, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${style} shadow-sm overflow-hidden flex items-center justify-center`}>
                      {i < 3 ? <User className="h-5 w-5 text-white/80" /> : "+8k"}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2D3142] mb-2 tracking-tight">Hive Network</h3>
                <p className="text-[#4A4E69]/70 text-sm leading-relaxed">Join 10k+ people finding strength together in our moderated, safe-space digital communes.</p>
              </div>
            </motion.div>

            {/* Feature 3 - Mood Trends */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-[#7C9885] to-[#8BA894] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <Activity className="h-10 w-10 text-white/40 group-hover:scale-125 transition-transform duration-500" />
                  <div className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">Weekly Avg: 8.4</div>
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Mood Trends</h3>
                <p className="text-white/70 text-sm mb-6">Deep longitudinal emotional mapping.</p>
                <div className="flex items-end gap-2.5 h-16">
                  {[35, 65, 40, 95, 55, 85, 75].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{
                        delay: i * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                      }}
                      className="flex-1 bg-white/30 rounded-t-sm group-hover:bg-white/50 transition-colors relative"
                    >
                      {i === 3 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">Peak</div>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section - Elevated Layout */}
        <section className="relative mb-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <motion.div
                animate={{
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="w-full aspect-square bg-[#7C9885]/20 relative overflow-hidden"
              >
                <img
                  src="/homebelow16-3.png"
                  className="w-full h-full object-cover mix-blend-overlay opacity-60"
                  alt="Abstract Wellness"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white rounded-3xl shadow-2xl p-8 border border-[#7C9885]/10 hidden sm:block">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-50 rounded-2xl text-red-400">
                    <Heart className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2D3142]">98%</div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">Satisfaction</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-red-400" />
                  </div>
                  <p className="text-xs text-[#4A4E69]/60 leading-relaxed font-light">Based on verified user feedback from our first 12,000 sessions.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2D3142] mb-8">Guided by Science,<br />Driven by Heart</h2>
              <p className="text-[#4A4E69] text-xl font-light leading-relaxed mb-12">
                Vaam was founded on the belief that premium mental health tools shouldn't be a luxury. We've built a sanctuary where technology serves the soul.
              </p>

              <div className="space-y-8">
                {[
                  { title: "Clinical Integrity", text: "Every interaction is grounded in evidence-based therapeutic frameworks.", icon: <Shield className="h-5 w-5" /> },
                  { title: "Universal Access", text: "Providing high-end tools to anyone with a smartphone, anywhere in the world.", icon: <Users className="h-5 w-5" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="bg-[#F9FBFF] p-4 rounded-2xl border border-[#7C9885]/20 text-[#7C9885] group-hover:bg-[#7C9885] group-hover:text-white transition-all shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#2D3142] mb-1">{item.title}</h4>
                      <p className="text-[#4A4E69]/70 font-light">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Floating Cloud Layout */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] overflow-hidden bg-[#2D3142]"
        >
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#7C9885]/20 rounded-full blur-[150px] -ml-96 -mt-96" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#4A4E69]/40 rounded-full blur-[150px] -mr-64 -mb-64" />
          </div>

          <div className="relative z-10 px-8 py-24 md:py-12 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              A calmer mind is just<br className="hidden md:block" /> one conversation away.
            </h2>
            <p className="text-white/60 text-xl mb-12 font-light leading-relaxed">
              Unlock your personalized sanctuary today. No credit cards, no barriers—just you and your growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleChatNow}
                className="w-full sm:w-auto bg-[#7C9885] hover:bg-white hover:text-[#2D3142] text-white px-12 py-5 rounded-[1.25rem] text-lg font-bold transition-all shadow-2xl active:scale-95"
              >
                Start My Journey
              </button>
              <button
                onClick={handleConnectWithPsychiatrist}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white/80 px-12 py-5 rounded-[1.25rem] text-lg font-bold transition-all active:scale-95"
              >
                Find Professional Help
              </button>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer - Enhanced Responsive */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8 sm:mt-12 lg:mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 sm:p-2 rounded-lg">
                  <Brain className="h-3 sm:h-4 lg:h-5 w-3 sm:w-4 lg:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Vaam
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Supporting your mental wellness journey with compassionate, evidence-based tools and community.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link to="/resources" className="hover:text-purple-600">Wellness Hub</Link></li>
                <li><a href="mailto:vaam319@gmail.com" className="hover:text-purple-600">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">Community</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link to="/community" className="hover:text-purple-600">Hive Network</Link></li>
                <li><Link to="/chatbot" className="hover:text-purple-600">24/7 Chat</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">Professional Help</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link to="/add-request" className="hover:text-purple-600">Connect with Psychiatrist</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-purple-600">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-purple-600">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">Not a Student?</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link to="/psychiatrist-auth" className="hover:text-purple-600">Psychiatrist Login</Link></li>
                <li><Link to="/admin-auth" className="hover:text-purple-600">Admin Login</Link></li>
                <li><Link to="/view-requests" className="hover:text-purple-600">View All Requests</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Audio Control */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={audioLoaded ? toggleMute : undefined}
        className="fixed bottom-8 right-8 z-50 h-14 w-14 bg-white/80 backdrop-blur-md border border-[#7C9885]/20 rounded-[1.25rem] shadow-xl flex items-center justify-center group transition-all"
      >
        {!audioLoaded ? (
          <div className="h-5 w-5 border-2 border-[#7C9885] border-t-transparent rounded-full animate-spin" />
        ) : isMuted ? (
          <VolumeX className="h-6 w-6 text-gray-400 group-hover:text-[#4A4E69]" />
        ) : (
          <Volume2 className="h-6 w-6 text-[#7C9885] group-hover:text-[#4A4E69]" />
        )}
      </motion.button>
    </div>
  );
}