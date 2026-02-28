import { useEffect, useState } from 'react';
import SessionList from './SessionList';
import useSessions from '../hooks/useSessions';
import { API_BASE_URL } from '../../src/utils/api';
import { useAuth } from '../../src/hooks/useAuth';
import { getAuth } from 'firebase/auth';

const SessionsPanel = ({ onSelectSession, darkMode }) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const { sessions, isLoading, refresh, setSessions } = useSessions(user?.token);

    const handleDeleteSession = async (sessionRef) => {
        if (!window.confirm('Are you sure you want to delete this conversation?')) return;

        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const idToken = await currentUser.getIdToken();

            const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionRef}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            if (response.ok) {
                setSessions(prev => prev.filter(s => s.sessionRef !== sessionRef)); // ✅ update UI instantly
            } else {
                console.error('Delete failed:', await response.text());
            }
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    return (
        <div className='p-2 relative'>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 mb-4 rounded-2xl text-[13px] font-medium transition-all focus:outline-none focus:ring-4 focus:ring-[#7C9885]/10 ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-2 border-transparent focus:border-[#7C9885]/30 text-[#2D3142] placeholder-[#4A4E69]/40 shadow-sm'
                    }`}
            />
            <SessionList
                sessions={sessions}
                onSelectSession={onSelectSession}
                onDeleteSession={handleDeleteSession}
                searchTerm={searchTerm}
                isLoading={isLoading}
                darkMode={darkMode}
            />
        </div>
    );
};

export default SessionsPanel;