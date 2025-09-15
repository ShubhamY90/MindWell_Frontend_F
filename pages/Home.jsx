import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import HomeImage from '../src/assets/HomeImage.png';
import {
  MessageCircle,
  Users,
  Brain,
  Heart,
  Smile,
  Calendar,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Volume2,
  VolumeX,
  UserCheck
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

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50,
      delay: 100
    });
  }, []);

  // Ultra-fast audio loading
useEffect(() => {
  const audio = new Audio();
  
  // Critical: Set properties BEFORE source for faster loading
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  audio.volume = 0.2;
  audio.loop = true;
  
  const handleCanPlay = () => {
    setAudioLoaded(true);
    audio.muted = isMuted;
  };

  const handleError = (e) => {
    console.error("Audio loading error:", e);
    // Try fallback source
    if (!audio.src.includes('fallback')) {
      audio.src = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav';
      audio.load();
    }
  };

  audio.addEventListener('canplay', handleCanPlay);
  audio.addEventListener('error', handleError);
  
  // Set source and load immediately
  audio.src = '/calm.mp3';
  audio.load(); // Start loading immediately
  
  audioRef.current = audio;

  return () => {
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('error', handleError);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, [isMuted]);

  // Instant interaction detection - no delays
const handleFirstInteraction = useCallback(() => {
  if (!hasInteracted && audioRef.current && !isMuted && audioLoaded) {
    audioRef.current.play().catch(console.error);
    setHasInteracted(true);
  }
}, [hasInteracted, isMuted, audioLoaded]);

useEffect(() => {
  if (audioLoaded && !hasInteracted) {
    const handleInteraction = () => handleFirstInteraction();
    
    // Multiple event types for faster response
    document.addEventListener('click', handleInteraction, { once: true, passive: true });
    document.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }
}, [handleFirstInteraction, audioLoaded, hasInteracted]);

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

  
 // Instant mute toggle
const toggleMute = useCallback(() => {
  if (!audioRef.current) return;
  
  const newMuted = !isMuted;
  audioRef.current.muted = newMuted;
  setIsMuted(newMuted);

  // Immediate play if unmuting
  if (!newMuted && audioLoaded) {
    audioRef.current.play().catch(console.error);
  }
}, [isMuted, audioLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <audio
        ref={audioRef}
        src="/calm.mp3"
        loop
        preload="auto"
        onPlay={() => console.log("Audio playing")}
        onPause={() => console.log("Audio paused")}
        onError={(e) => console.error("Audio error:", e)}
      />

      {/* Mood Test Modal - Fully Responsive */}
      {showMoodTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Question {currentQuestion + 1} of {moodQuestions.length}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {moodQuestions[currentQuestion].question}
            </p>
            <div className="space-y-2 sm:space-y-3">
              {moodQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodAnswer(index)}
                  className="w-full text-left p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodTest(false)}
              className="mt-4 sm:mt-6 text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Full Screen Image */}
      <div className="relative">
        {/* Full Screen Background Image */}
        <div className="relative h-screen w-full overflow-hidden">
          <img
            src={HomeImage}
            alt="Mental wellness background"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />

          {/* Hero Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight max-w-4xl" data-aos="fade-up">
                Your Mental Wellness
              </h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white sm:mb-6 leading-tight max-w-4xl" data-aos="fade-up">
                Journey Starts Here
              </h1>
            </div>

            <div className="max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10" data-aos="fade-up" data-aos-delay="100">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-1 sm:mb-2 px-2">
                Take control of your mental health with personalized support, community
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 px-2">
                connection, and evidence-based tools designed to help you thrive.
              </p>
            </div>

            {/* Mood Status/Test Section */}
            <div className="mb-6 sm:mb-8 md:mb-12" data-aos="fade-up" data-aos-delay="200">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4 md:mb-6">
                How are you feeling today?
              </h3>
              <button
                onClick={startMoodTest}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center"
              >
                <Heart className="h-3 sm:h-4 w-3 sm:w-4 mr-2" />
                Take Mood Test
              </button>
            </div>

            {/* CTA Buttons - Fully Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md sm:max-w-none" data-aos="fade-up" data-aos-delay="300">
              <button
                onClick={handleChatNow}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <MessageCircle className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 mr-2" />
                Start Wellness Chat
                <ArrowRight className="h-3 sm:h-4 md:h-5 w-3 sm:w-4 md:w-5 ml-2" />
              </button>
              <a
                href="/resources"
                className="w-full sm:w-auto border-2 border-white text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-200 text-center"
              >
                Explore Resources
              </a>
            </div>

            {/* Connect with Psychiatrist Button */}
            <div className="mt-6 sm:mt-8" data-aos="fade-up" data-aos-delay="400">
              <button
                onClick={handleConnectWithPsychiatrist}
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-white/30 transition-all duration-200 inline-flex items-center"
              >
                <UserCheck className="h-3 sm:h-4 w-3 sm:w-4 mr-2" />
                Connect with Psychiatrist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Features Section - Enhanced Responsive Grid */}
        <section id="features" className="py-12 sm:py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 lg:mb-16" data-aos="fade-up">
            Everything you need for better mental health
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" data-aos="fade-up">
            <div
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" data-aos-delay="0"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-lg w-fit mb-3 sm:mb-4">
                <MessageCircle className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">24/7 AI Support</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">
                Get instant support from our AI wellness companion, trained to provide empathetic,
                evidence-based guidance whenever you need it.
              </p>
              <button
                onClick={handleChatNow}
                className="text-purple-600 font-medium hover:text-purple-700 flex items-center text-xs sm:text-sm lg:text-base"
              >
                Chat now <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
              </button>
            </div>

            <div
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              data-aos="fade-up" data-aos-delay="150"
            >
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 sm:p-3 rounded-lg w-fit mb-3 sm:mb-4">
                <Users className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Supportive Community</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">
                Connect with others on similar journeys in our safe, moderated community spaces.
                Share experiences and find encouragement.
              </p>
              <Link to="/community" className="text-purple-600 font-medium hover:text-purple-700 flex items-center text-xs sm:text-sm lg:text-base">
                Join community <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
              </Link>
            </div>

            <div
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 md:col-span-2 lg:col-span-1"
              data-aos="fade-up" data-aos-delay="300"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 sm:p-3 rounded-lg w-fit mb-3 sm:mb-4">
                <Brain className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Personalized Tools</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">
                Access mood tracking, guided meditations, cognitive behavioral therapy exercises,
                and other tools tailored to your needs.
              </p>
              <Link to="/therapies" className="text-purple-600 font-medium hover:text-purple-700 flex items-center text-xs sm:text-sm lg:text-base">
                Explore tools <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* What We Do Section - Enhanced Responsive */}
        <section
          className="bg-white py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 text-center rounded-xl lg:rounded-2xl shadow-lg mb-12 sm:mb-16 lg:mb-20"
          data-aos="fade-up"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 lg:mb-6">What We Do</h2>
          <p className="max-w-xl lg:max-w-2xl mx-auto text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
            Our mission is to provide holistic support for mental wellness through education, connection, and compassionate care.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg lg:rounded-xl shadow-md" data-aos="fade-up">
              <Smile className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 mx-auto text-purple-600 mb-2 sm:mb-3 lg:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Emotional Support</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                We offer tools and resources that help individuals manage stress, anxiety, and emotional challenges with care.
              </p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg lg:rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="150">
              <Calendar className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 mx-auto text-purple-600 mb-2 sm:mb-3 lg:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Resources</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Interactive and mindfulness resources designed for your well-being.
              </p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg lg:rounded-xl shadow-md sm:col-span-2 lg:col-span-1" data-aos="fade-up" data-aos-delay="300">
              <Heart className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 mx-auto text-purple-600 mb-2 sm:mb-3 lg:mb-4" />
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Healing with Compassion</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Whether through therapy, community, or AI companions, we ensure you're never alone in your journey.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Indicators - Enhanced Responsive */}
        <section className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Trusted by thousands</h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">Safe, secure, and clinically informed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                <Shield className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm lg:text-base">Privacy First</h3>
              <p className="text-xs sm:text-sm text-gray-600">Your data is encrypted and never shared</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                <Clock className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm lg:text-base">Always Available</h3>
              <p className="text-xs sm:text-sm text-gray-600">Support when you need it most</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-full mb-2 sm:mb-3">
                <Star className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm lg:text-base">Evidence-Based</h3>
              <p className="text-xs sm:text-sm text-gray-600">Backed by clinical research</p>
            </div>
          </div>
        </section>

        {/* Final CTA - Enhanced Responsive */}
        <section
          className="relative overflow-hidden text-center rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-white my-8 sm:my-12 lg:my-20"
          data-aos="zoom-in"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/homebelow16-3.png"
              alt="Healing Background"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Decorative elements - Responsive visibility */}
          <div className="hidden md:block absolute top-[-30px] left-[-30px] w-32 lg:w-40 h-32 lg:h-40 bg-purple-400 opacity-30 blur-3xl rounded-full animate-pulse z-10" />
          <div className="hidden md:block absolute bottom-[-40px] right-[-20px] w-40 lg:w-48 h-40 lg:h-48 bg-blue-400 opacity-30 blur-2xl rounded-full animate-bounce-slow z-10" />

          {/* Content */}
          <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4 relative z-20" data-aos="fade-up" data-aos-delay="50">
            <span className="text-xl sm:text-2xl lg:text-4xl">🌟✨💜</span>
          </div>

          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-tight relative z-20"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Start Your Healing Journey Today
          </h2>

          <p
            className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 lg:mb-8 opacity-90 max-w-sm sm:max-w-xl mx-auto relative z-20 px-2 sm:px-4"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            Embrace calm, build resilience, and take the first step toward a better you.
            You're never alone — and your peace of mind matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
            <button
              onClick={handleChatNow}
              className="bg-white text-purple-600 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
              data-aos="fade-up"
              data-aos-delay="350"
            >
              <MessageCircle className="h-3 sm:h-4 lg:h-5 w-3 sm:w-4 lg:w-5 mr-2 text-purple-600" />
              Begin Your Journey
            </button>

            <button
              onClick={handleConnectWithPsychiatrist}
              className="bg-transparent border-2 border-white text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <UserCheck className="h-3 sm:h-4 lg:h-5 w-3 sm:w-4 lg:w-5 mr-2" />
              Connect with Professional
            </button>
          </div>
        </section>
      </main>

      {/* Footer - Enhanced Responsive */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8 sm:mt-12 lg:mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 sm:p-2 rounded-lg">
                  <Brain className="h-3 sm:h-4 lg:h-5 w-3 sm:w-4 lg:w-5 text-white" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MindWell
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                Supporting your mental wellness journey with compassionate, evidence-based tools and community.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link to="/resources" className="hover:text-purple-600">Crisis Resources</Link></li>
                <li><a href="mailto:aryabrata.swain.ug23@nsut.ac.in" className="hover:text-purple-600">Contact Us</a></li>
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
              <h4 className="font-semibold text-gray-800 mb-4">Professional Help</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/add-request" className="hover:text-purple-600">Connect with Psychiatrist</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-purple-600">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-purple-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-600">
            <p>&copy; 2025 MindWell. All rights reserved. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>

      {/* Audio Control Button - Responsive */}
      <button
        onClick={audioLoaded ? toggleMute : undefined}
        className={`fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-full shadow-md p-2 sm:p-3 hover:shadow-lg transition-all ${!audioLoaded ? "opacity-50 cursor-not-allowed" : ""
          }`}
        title={isMuted ? "Unmute sound" : "Mute sound"}
      >
        {isMuted ? (
          <VolumeX className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
        ) : (
          <Volume2 className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
        )}
      </button>

      {/* Audio Loading Indicator */}
      {!audioLoaded && (
        <div className="fixed bottom-16 right-4 z-40 bg-white border border-gray-300 rounded-lg shadow-md p-2 text-xs text-gray-600">
          Loading audio...
        </div>
      )}
    </div>
  );
}