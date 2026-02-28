import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import useChat from '../hooks/useChat';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import SessionPanel from './SessionPanel';
import { API_BASE_URL } from '../../src/utils/api';
// import { decryptText } from '../../src/utils/encryption';

const ChatWindow = ({ darkMode, currentUser, checkingAuth }) => {
  const [showHistory, setShowHistory] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const {
    messages,
    isLoading,
    error,
    sessionRef,
    sendMessage,
    loadSession,
    clearChat,
    clearError,
  } = useChat();

  useEffect(() => {
    if (!checkingAuth && !currentUser) {
      navigate('/auth');
    }
  }, [checkingAuth, currentUser, navigator]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showHistory]);

  if (checkingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-400 to-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="mt-4 text-lg font-medium animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }




  const handleSelectSession = async (sessionRef) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionRef}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load session');

      const history = data.session.history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts[0].text }],
        videos: msg.videos || [],
      }));

      loadSession({
        sessionRef: data.session.sessionRef,
        history,
      });

      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load session:', err.message);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleNewChat = () => {
    clearChat();
    setShowHistory(false);
  };

  return (
    <div className={`w-full h-screen pt-24 md:pt-28 ${darkMode ? 'bg-[#12141C]' : 'bg-[#F9FBFF]'} flex flex-col font-sans transition-colors duration-500`}>

      {/* Floating Disclaimer */}
      <div className="fixed bottom-24 right-8 z-50 flex items-end justify-end">
        <AnimatePresence>
          {showDisclaimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`mr-4 ${darkMode ? 'bg-[#1E202C]/90 text-yellow-200 border-yellow-700/30' : 'bg-white/90 text-yellow-800 border-yellow-200'} backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex border`}
            >
              <div className="px-5 py-3 flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span>AI Companion — NOT medical advice. <br />Use as a supportive space.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowDisclaimer(!showDisclaimer)}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all backdrop-blur-md border ${showDisclaimer
            ? darkMode ? 'bg-yellow-600/20 text-yellow-500 border-yellow-500/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : darkMode ? 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-yellow-500' : 'bg-white text-gray-400 border-gray-100 hover:text-yellow-600'
            }`}
        >
          {showDisclaimer ? <X className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Abstract Background Elements */}
        {!darkMode && (
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#7C9885]/10 rounded-full blur-[100px] pointer-events-none" />
        )}
        <div className={`absolute bottom-0 right-0 w-96 h-96 ${darkMode ? 'bg-[#7C9885]/5' : 'bg-[#7C9885]/5'} rounded-full blur-[120px] pointer-events-none`} />

        {/* Side Panel */}
        <aside
          className={`
            ${showHistory ? 'w-80 p-6' : 'w-0 p-0'}
            transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${darkMode ? 'bg-[#12141C]/90 border-gray-800' : 'bg-white/70 backdrop-blur-2xl border-gray-100'}
            border-r flex flex-col h-full overflow-hidden z-20
          `}
        >
          <div className={`transition-opacity duration-300 ${showHistory ? 'opacity-100' : 'opacity-0 invisible'}`}>
            <div className="flex justify-between items-center mb-8 pl-2">
              <h2 className={`text-[10px] font-black tracking-[0.25em] uppercase ${darkMode ? 'text-gray-500' : 'text-[#7C9885]'}`}>Insights History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className={`p-2.5 rounded-xl transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <SessionPanel
                onSelectSession={handleSelectSession}
                darkMode={darkMode}
              />
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col relative overflow-hidden z-10 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>

          <header className={`px-8 py-5 flex items-center justify-between flex-shrink-0 bg-transparent border-b ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex items-center space-x-5">
              {!showHistory && (
                <button
                  onClick={handleShowHistory}
                  className={`p-3 rounded-2xl transition-all shadow-sm ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700/50' : 'bg-white text-gray-500 hover:text-[#7C9885] hover:shadow-md border border-gray-100'}`}
                >
                  <History size={20} />
                </button>
              )}
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <span className={darkMode ? 'text-[#7C9885]' : 'text-[#5E7A67]'}>MindWell</span>
                  <span className="font-medium opacity-80">Counselor</span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${darkMode ? 'bg-[#7C9885]' : 'bg-[#7C9885]'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-50`}>
                    {sessionRef ? `Session / ${sessionRef.split('T')[0]}` : 'Ready to support'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className={`flex items-center space-x-2 py-3.5 px-6 rounded-2xl text-[11px] uppercase tracking-[0.2em] font-black transition-all shadow-2xl hover:-translate-y-1 active:scale-95 ${darkMode ? 'bg-[#7C9885] text-white hover:bg-[#688270] shadow-[#7C9885]/20' : 'bg-[#2D3142] text-white hover:bg-black shadow-black/10'
                }`}
            >
              <Plus size={16} strokeWidth={3} />
              <span>New Insight</span>
            </button>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-2 relative custom-scrollbar">
            {messages.length === 0 && !isLoading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center h-full flex flex-col justify-center items-center py-12 px-4"
              >
                <div className={`relative mb-12 group`}>
                  <div className={`absolute -inset-8 bg-[#7C9885]/10 rounded-full blur-3xl group-hover:bg-[#7C9885]/20 transition-all duration-700`} />
                  <div className={`relative w-32 h-32 rounded-[3.5rem] flex items-center justify-center shadow-2xl transition-transform duration-700 group-hover:scale-110 ${darkMode ? 'bg-[#1E202C] border-gray-800' : 'bg-white border-gray-100'
                    } border-2`}>
                    <span className="text-6xl filter drop-shadow-xl select-none">🌿</span>
                    <div className="absolute -bottom-1 -right-1 bg-[#7C9885] w-8 h-8 rounded-2xl border-4 border-white dark:border-[#12141C] shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1] max-w-2xl">
                  Your safe space for <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? 'from-[#7C9885] to-emerald-400' : 'from-[#5E7A67] to-[#7C9885]'}`}>emotional clarity.</span>
                </h2>

                <p className={`text-base md:text-lg opacity-60 max-w-lg mx-auto leading-relaxed mb-16 font-medium`}>
                  MindWell AI is more than a chatbot—it's a supportive companion designed to listen, reflect, and guide you through life's complexities.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
                  {[
                    {
                      title: "Emotional Support",
                      sub: "Navigate stress and anxiety with gentle reflection.",
                      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                      prompt: "I've been feeling a bit overwhelmed lately and need someone to talk to."
                    },
                    {
                      title: "Focus & Grounding",
                      sub: "Re-center yourself with mindfulness techniques.",
                      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                      prompt: "I need a moment to gather my thoughts. Can you help me practice a grounding exercise?"
                    }
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(card.prompt)}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden ${darkMode
                        ? 'bg-[#1E202C] border-gray-800 hover:border-[#7C9885]/40 hover:bg-[#252836]'
                        : 'bg-white border-gray-50 hover:border-[#7C9885]/20 hover:shadow-[0_20px_50px_rgba(124,152,133,0.1)]'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all group-hover:scale-110 shadow-inner ${darkMode ? 'bg-gray-800 text-[#7C9885]' : 'bg-[#F9FBFF] text-[#5E7A67]'
                        }`}>
                        {card.icon}
                      </div>
                      <p className={`font-black text-lg mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {card.title}
                        <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#7C9885]">→</span>
                      </p>
                      <p className="text-[13px] font-medium opacity-50 leading-relaxed">{card.sub}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message.content}
                    videoSuggestions={message.videoSuggestions || []}
                    isUser={message.sender === 'user'}
                    timestamp={message.timestamp}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

            {isLoading && (
              <div className="max-w-4xl mx-auto w-full mb-8">
                <LoadingIndicator darkMode={darkMode} />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-md mx-auto sticky bottom-4 z-50"
                >
                  <div className={`p-4 rounded-2xl flex justify-between items-center text-xs font-bold shadow-2xl backdrop-blur-xl border ${darkMode ? 'bg-red-900/80 text-red-100 border-red-500/20' : 'bg-red-50 text-red-900 border-red-200'
                    }`}>
                    <span className="flex items-center gap-2">⚠️ {error}</span>
                    <button onClick={clearError} className="px-3 py-1.5 rounded-lg bg-red-400/20 hover:bg-black/10 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-10" />
          </div>

          {/* Footer Input */}
          <footer className={`px-4 pt-4 pb-8 flex-shrink-0 z-20 ${darkMode ? 'bg-transparent' : 'bg-white/20 backdrop-blur-md'}`}>
            <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={sendMessage} disabled={isLoading} darkMode={darkMode} />
              <div className="flex items-center justify-center gap-4 mt-4 opacity-30 select-none">
                <div className="h-[1px] w-12 bg-gray-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Space</p>
                <div className="h-[1px] w-12 bg-gray-400" />
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ChatWindow;