import { useState, useEffect, useRef } from 'react';
import { X, History, Plus, LogOut, Moon, Sun } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { auth } from '../../context/firebase/firebase';
import useChat from '../hooks/useChat';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import SessionPanel from './SessionPanel';
import { decryptText } from '../../src/utils/encryption';

const ChatWindow = ({ darkMode, toggleDarkMode }) => {
  const [showHistory, setShowHistory] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showHistory]);

  
  const fetchSessions = async () => {
    setIsLoadingHistory(true);
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const idToken = await currentUser.getIdToken();
      const response = await fetch('http://localhost:4000/api/sessions', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectSession = async (sessionRef) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`http://localhost:4000/api/sessions/${sessionRef}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load session');
  
      // 🔐 Decrypt history
      // const decryptedHistory = await Promise.all(
      //   data.session.history.map(async (msg) => ({
      //     role: msg.role,
      //     parts: [{ text: await decryptText(msg.parts[0].text) }],
      //     videos: msg.videos || [],
      //   }))
      // );

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

  const handleDeleteSession = async (sessionRef) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error('User not authenticated');
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:4000/api/sessions/${sessionRef}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.sessionRef !== sessionRef));
      } else {
        console.error('Failed to delete session');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleLogout = () => signOut(auth);
  const handleShowHistory = () => {
    setShowHistory(true);
    fetchSessions();
  };
  const handleNewChat = () => {
    clearChat();
    setShowHistory(false);
  };

  return (
    <div className={`w-full h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col font-sans`}>
      <header className="w-full h-[81px] flex-shrink-0" />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel */}
        <aside
          className={`
            ${showHistory ? 'w-72 p-4' : 'w-0 p-0'}
            transition-all duration-300 ease-in-out
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}
            border-r
            flex flex-col h-full overflow-hidden
          `}
        >
          {showHistory && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-300'}`}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <SessionPanel
                  sessions={sessions}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                  isLoading={isLoadingHistory}
                  darkMode={darkMode}
                />
              </div>
              <div className={`pt-4 mt-auto border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-800/80 text-gray-200' : 'bg-white text-gray-900'}`}>
          {/* Chat Header */}
          <header className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              {!showHistory && (
                <button
                  onClick={handleShowHistory}
                  className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <History size={20} />
                </button>
              )}
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assistant
                {sessionRef && (
                  <span className={`text-xs ml-2 align-middle font-mono ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {sessionRef.split('T')[0]}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewChat}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <Plus size={16} />
                <span>New Chat</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !isLoading ? (
              <div className={`text-center h-full flex flex-col justify-center items-center ${
                darkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <svg
                    className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Start a new conversation or select one from history.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message.content}
                  videoSuggestions={message.videoSuggestions || []}
                  isUser={message.sender === 'user'}
                  timestamp={message.timestamp}
                  darkMode={darkMode}
                />
              ))
            )}
            {isLoading && <LoadingIndicator darkMode={darkMode} />}
            {error && (
              <div className={`p-3 rounded-lg flex justify-between items-center text-sm ${
                darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
              }`}>
                <span>⚠️ {error}</span>
                <button onClick={clearError} className="font-semibold hover:opacity-80">
                  Dismiss
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className={`p-4 border-t flex-shrink-0 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={sendMessage} disabled={isLoading} darkMode={darkMode} />
              <p className={`text-xs text-center mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ChatWindow;