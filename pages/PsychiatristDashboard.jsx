import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { API_BASE_URL } from '../src/utils/api';
import ChatRoom from './ChatRoom'; // Import the ChatRoom component

const Card = ({ title, children, icon, count }) => (
  <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {count !== undefined && (
              <p className="text-sm text-gray-500 mt-0.5">{count} total</p>
            )}
          </div>
        </div>
        {count > 0 && (
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-sm font-bold shadow-lg animate-pulse">
            {count}
          </div>
        )}
      </div>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const EmptyState = ({ icon, title, description, actionText, onAction }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-6">
      <div className="text-gray-400 scale-150">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
      {description}
    </p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {actionText}
      </button>
    )}
  </div>
);

const RequestCard = ({ request, type, onAction }) => (
  <div className="bg-gradient-to-r from-white/60 to-gray-50/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-md transition-all duration-200 hover:from-white/80 hover:to-gray-50/80">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
          {request.studentName.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">{request.studentName}</h4>
          <p className="text-gray-600 text-sm mb-2">{request.email}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {request.requestDate}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {request.urgency}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{request.reason}</p>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        {type === 'pending' && (
          <>
            <button
              onClick={() => onAction(request.id, 'accept')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Accept
            </button>
            <button
              onClick={() => onAction(request.id, 'decline')}
              className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-medium rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              Decline
            </button>
          </>
        )}
        {type === 'accepted' && (
          <button
            onClick={() => onAction(request.id, 'message', request.email)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
        )}
      </div>
    </div>
  </div>
);

const PsychiatristDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/psychiatrist-auth');
  };

  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentChatStudent, setCurrentChatStudent] = useState(null);
  const college = user?.college || null;
  const psychiatristId = user?.email || null;

   const fetchRequests = async () => {
    if (!college || !psychiatristId) return;
    setLoading(true);
    try {
      const [pendingRes, acceptedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/request/college/${encodeURIComponent(college)}?status=pending`),
        fetch(`${API_BASE_URL}/api/request/college/${encodeURIComponent(college)}?status=accepted`),
      ]);

      const [pendingData, acceptedData] = await Promise.all([pendingRes.json(), acceptedRes.json()]);
      if (!pendingRes.ok) throw new Error(pendingData.error || 'Failed to load pending');
      if (!acceptedRes.ok) throw new Error(acceptedData.error || 'Failed to load accepted');

      const mapToCard = (r) => ({
        id: r.id,
        studentName: r.studentName || 'Unknown',
        email: r.studentEmail || '',
        reason: r.message || '',
        urgency: r.status === 'pending' ? 'Awaiting response' : 'Accepted',
        requestDate: new Date(r.createdAt).toLocaleString(),
        // Keep the original request data for filtering
        originalRequest: r
      });

      // Filter pending requests (show all pending)
      setPendingRequests((pendingData.requests || []).map(mapToCard));
      
      // Filter accepted requests to only show those accepted by this psychiatrist
      const filteredAccepted = (acceptedData.requests || []).filter(
        request => request.psychiatristId === psychiatristId
      );
      
      setAcceptedRequests(filteredAccepted.map(mapToCard));
    } catch (err) {
      console.error('Fetch requests error:', err);
      setPendingRequests([]);
      setAcceptedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [college]);

  const handleAction = async (requestId, action, studentEmail = null) => {
    if (action === 'message') {
      // Open chat dialog with the student
      setCurrentChatStudent(studentEmail);
      setShowChat(true);
      return;
    }
    
    if (!psychiatristId || !user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/request/respond-atomic/${requestId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ psychiatristId, action: action === 'decline' ? 'reject' : action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to respond');
      }
      await fetchRequests();
    } catch (err) {
      console.error('Respond error:', err);
      await fetchRequests();
    }
  };

  const handleRefresh = () => {
    fetchRequests();
  };

  const closeChat = () => {
    setShowChat(false);
    setCurrentChatStudent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-40 left-16 w-28 h-28 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 17H9.154a3.374 3.374 0 00-1.849-.553L6.757 16z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MindWell
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Students
                </span>
              </div>
              
              <button onClick={handleLogout} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {`Welcome Back, ${user?.name || 'Doctor'} 👨‍⚕️`}
              </h1>
              <p className="text-gray-600 text-lg">
                Review student connection requests and manage your assignments with care 💙
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl text-gray-700 hover:bg-white/90 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card 
            title="Pending Requests" 
            count={pendingRequests.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="No pending requests"
                description="All caught up! New student requests will appear here when they need your support."
                actionText="Check for Updates"
                onAction={handleRefresh}
              />
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="pending"
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card 
            title="Accepted Requests" 
            count={acceptedRequests.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {acceptedRequests.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                title="No active connections"
                description="Students you've accepted will appear here. Start building meaningful connections!"
              />
            ) : (
              <div className="space-y-4">
                {acceptedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="accepted"
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">127</h3>
            <p className="text-gray-600 text-sm">Students Helped</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">4.9</h3>
            <p className="text-gray-600 text-sm">Average Rating</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
            <p className="text-gray-600 text-sm">Availability</p>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-96 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Chat with {currentChatStudent}
              </h3>
              <button
                onClick={closeChat}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <ChatRoom 
                userId={user.email} 
                otherUserId={currentChatStudent} 
                userRole={user.role}
                isModal={true}
                onClose={closeChat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychiatristDashboard;