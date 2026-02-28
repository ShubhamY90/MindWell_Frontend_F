// useSessions.js
import { useEffect, useState } from 'react';
const API_BASE_URL = 'http://localhost:5001'; // Fallback just in case, though it should come from utils

let globalSessionCache = null;
let lastSessionFetchTime = 0;
const SESSION_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

const useSessions = (idToken) => {
  const [sessions, setSessions] = useState(globalSessionCache || []);
  const [isLoading, setIsLoading] = useState(!globalSessionCache);

  const fetchSessions = async (force = false) => {
    if (!idToken) {
      if (!globalSessionCache) setIsLoading(false);
      return;
    }

    if (!force && globalSessionCache && (Date.now() - lastSessionFetchTime < SESSION_CACHE_TTL)) {
      setSessions(globalSessionCache);
      setIsLoading(false);

      // Still fetch in background to keep data fresh, but don't show loading spinner
      fetchFromAPI(idToken, true);
      return;
    }

    if (!globalSessionCache || force) setIsLoading(true);
    await fetchFromAPI(idToken, false);
  };

  const fetchFromAPI = async (token, isBackground) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sessions');

      const parsed = data.sessions.map(session => {
        // Derive title: title field -> prompt field -> first user message -> default
        const title = session.title ||
          session.prompt ||
          (session.history?.[0]?.parts?.[0]?.text?.substring(0, 40)) ||
          'Untitled Conversation';

        // Derive lastMessage: lastMessage field -> reply field -> last model message -> default
        const lastMessage = session.lastMessage ||
          session.reply?.trim() ||
          (session.history?.[session.history.length - 1]?.parts?.[0]?.text?.substring(0, 60)) ||
          '';

        return {
          sessionRef: session.sessionRef,
          title: title,
          lastMessage: lastMessage,
          updatedAt: session.updatedAt || session.createdAt,
          createdAt: session.createdAt
        };
      });

      setSessions(parsed);
      globalSessionCache = parsed;
      lastSessionFetchTime = Date.now();
    } catch (err) {
      console.error('Session fetch error:', err);
      setSessions([]);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [idToken]);

  return {
    sessions,
    setSessions,
    isLoading,
    refresh: fetchSessions
  };
};

export default useSessions;