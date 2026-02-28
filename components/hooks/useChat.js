import { useState, useCallback, useRef, useEffect } from 'react';
// import { speakText } from '../services/TextToSpeech';
import { getAuth } from 'firebase/auth';
import { API_BASE_URL } from '../../src/utils/api';

const useChat = ({ enableTTS = true, isComplex = false } = {}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionRef, setSessionRef] = useState(null);
  const [videoSuggestions, setVideoSuggestions] = useState([]);

<<<<<<< HEAD
  const actuallySendRequest = useCallback(async (updatedHistory) => {
=======
  const actuallySendRequest = useCallback(async (content, updatedHistory) => {
>>>>>>> upstream/main
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
<<<<<<< HEAD
          prompt: updatedHistory.at(-1).parts[0].text,
=======
          prompt: content,   
>>>>>>> upstream/main
          isComplex,
          history: updatedHistory,
          sessionRef
        }),
      });

<<<<<<< HEAD
      const data = await response.json();
      if (!response.ok) throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Chat failed');

      const aiMessage = {
        id: Date.now() + 1,
        content: data.text,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        videoSuggestions: data.videos || []
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.sessionRef && !sessionRef) {
        setSessionRef(data.sessionRef);
      }

      if (enableTTS && data.text) {
        const audio = new Audio('response.wav');
        audio.play();
=======
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Chat failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        videoSuggestions: []
      }]);

      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                accumulatedText += data.text;
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId ? { ...msg, content: accumulatedText } : msg
                ));
              }

              if (data.done) {
                if (data.sessionRef && !sessionRef) setSessionRef(data.sessionRef);
                if (data.videos) {
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, videoSuggestions: data.videos } : msg
                  ));
                }
              }
            } catch (e) {
              console.warn('Error parsing stream chunk:', e);
            }
          }
        }
>>>>>>> upstream/main
      }

    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
<<<<<<< HEAD
  }, [enableTTS, isComplex, sessionRef]);
=======
  }, [isComplex, sessionRef]);
>>>>>>> upstream/main

  const sendMessage = useCallback((content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);
    setError(null);

<<<<<<< HEAD
    // Step 1: Add user message to state
    setMessages(prev => [...prev, userMessage]);

    // Step 2: Create updatedHistory manually
    const updatedHistory = [
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      {
        role: 'user',
        parts: [{ text: content.trim() }]
      }
    ];

    // Step 3: Call API
    actuallySendRequest(updatedHistory);
=======
    // Step 1: Add user message to state INSTANTLY
    setMessages(prev => [...prev, userMessage]);

    // Step 2: Create updatedHistory
    const updatedHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Step 3: Call API (passing content separately to avoid stale closure issues if any)
    actuallySendRequest(content.trim(), updatedHistory);
>>>>>>> upstream/main

  }, [messages, actuallySendRequest]);

  const loadSession = useCallback((sessionData) => {
    if (sessionData.history) {
      const convertedMessages = sessionData.history.map((msg, index) => ({
        id: Date.now() + index,
        content: msg.parts[0].text,
        sender: msg.role === 'user' ? 'user' : 'ai',
        timestamp: new Date().toISOString(),
        videoSuggestions: msg.videos || []
      }));
      setMessages(convertedMessages);
      setSessionRef(sessionData.sessionRef);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSessionRef(null);
  }, [enableTTS, isComplex, sessionRef]);

  return {
    messages,
    isLoading,
    error,
    sessionRef,
    videoSuggestions,
    sendMessage,
    loadSession,
    clearChat,
    clearError: () => setError(null)
  };
};

export default useChat;