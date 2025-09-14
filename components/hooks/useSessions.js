// useSessions.js
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../src/utils/api';

const useSessions = (idToken) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    if (!idToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sessions');

      const parsed = data.sessions.map(session => ({
        sessionRef: session.sessionRef,
        title: session.prompt || 'Untitled',
        lastMessage: session.reply?.trim() || '',
        updatedAt: session.updatedAt || session.createdAt,
      }));

      setSessions(parsed);
    } catch (err) {
      console.error('Session fetch error:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
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