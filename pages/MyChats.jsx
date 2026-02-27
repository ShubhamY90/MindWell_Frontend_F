import React, { useEffect, useMemo, useState } from "react";
import { db } from "../context/firebase/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import ChatRoom from "./ChatRoom";
import { useAuth } from "../src/hooks/useAuth";
import { API_BASE_URL } from "../src/utils/api";
import {
  MessageSquare, Users, Clock, Send, CheckCircle,
  XCircle, Brain, Plus, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";

function MyChats() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const userRole = user?.role;
  const college = user?.college;

  const isProfessional = ['psychiatrist', 'doctor', 'company_doctor', 'admin', 'central_admin', 'overall_admin'].includes(userRole);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request states
  const [requests, setRequests] = useState([]); // For Psychiatrists
  const [myRequest, setMyRequest] = useState(null); // For Students
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [viewMode, setViewMode] = useState("chats"); // 'chats' or 'requests'
  const [actionLoading, setActionLoading] = useState(null);
  const [participants, setParticipants] = useState({}); // UID -> { name, role }
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 1. Fetch Chats (Shared)
  useEffect(() => {
    if (!userId) return;

    const qSender = query(collection(db, "chats"), where("senderId", "==", userId));
    const qReceiver = query(collection(db, "chats"), where("receiverId", "==", userId));

    const merge = (docs) => docs.map(d => ({ id: d.id, ...d.data() }));

    let senderChats = [];
    let receiverChats = [];

    const unsub1 = onSnapshot(qSender, snap => {
      senderChats = merge(snap.docs);
      updateChats();
    });

    const unsub2 = onSnapshot(qReceiver, snap => {
      receiverChats = merge(snap.docs);
      updateChats();
    });

    const updateChats = () => {
      const allChats = [...senderChats, ...receiverChats];
      const uniqueChats = Array.from(
        new Map(allChats.map(chat => [chat.id, chat])).values()
      );
      setChats(uniqueChats);
      setLoading(false);
    };

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

  // 2. Fetch Requests for Psychiatrists
  useEffect(() => {
    if (!isProfessional) return;

    // Broadcast: Psychiatrists see all pending requests globally
    const q = query(
      collection(db, "requests"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [userRole]);

  // 3. Fetch User's Own Request (For Students)
  useEffect(() => {
    if (isProfessional || !userId) return;

    const q = query(
      collection(db, "requests"),
      where("studentId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      // Get the most recent request
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const latest = reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      setMyRequest(latest || null);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  // 4. Resolve Participant Details (Names/Roles)
  useEffect(() => {
    if (chats.length === 0) return;

    const fetchMissing = async () => {
      const otherUserIds = [...new Set(chats.map(c => c.senderId === userId ? c.receiverId : c.senderId))];
      const missingIds = otherUserIds.filter(id => !participants[id]);

      if (missingIds.length === 0) return;

      const newDetails = { ...participants };
      let updated = false;

      await Promise.all(missingIds.map(async (id) => {
        // Mark as "fetching" with placeholder to avoid redundant parallel calls
        newDetails[id] = { name: "...", role: "unknown", loading: true };
        updated = true;

        try {
          const docSnap = await getDoc(doc(db, "users", id));
          if (docSnap.exists()) {
            newDetails[id] = {
              name: docSnap.data().name || "Unknown User",
              role: docSnap.data().role || "student",
              loading: false
            };
          } else {
            newDetails[id] = { name: "MindWell User", role: "unknown", loading: false };
          }
        } catch (err) {
          console.warn("Failed to fetch user info:", id);
          newDetails[id] = { name: "User", role: "unknown", loading: false };
        }
      }));

      if (updated) {
        setParticipants(prev => ({ ...prev, ...newDetails }));
      }
    };

    fetchMissing();
  }, [chats, userId]); // Removed participants from deps to prevent loops

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestReason.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/request/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userId,
          college: college,
          message: requestReason,
        }),
      });

      if (res.ok) {
        setShowRequestForm(false);
        setRequestReason("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send request");
      }
    } catch (err) {
      alert("Error sending request");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    if (!userId) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/request/respond-atomic/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ psychiatristId: userId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to respond');
      }

      if (action === 'accept') {
        setViewMode('chats');
        setRequests(prev => prev.filter(req => req.id !== requestId));
      } else if (action === 'reject') {
        // Optimistically remove the rejected request from the UI
        setRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChatSelect = (otherUserId, chatId) => {
    setSelectedChat({ id: chatId, otherUserId });
  };

  const sortedChats = useMemo(() => {
    const getTime = (v) => {
      if (!v) return 0;
      if (typeof v?.toDate === 'function') return v.toDate().getTime();
      try { return new Date(v).getTime(); } catch { return 0; }
    };
    return [...chats].sort((a, b) => getTime(b.lastMessageAt) - getTime(a.lastMessageAt));
  }, [chats]);

  const getAvatarColors = (id) => {
    const colors = [
      'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500',
      'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
    ];
    const hash = id?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  const formatTime = (v) => {
    if (!v) return '';
    const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(v);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F9FBFF] pt-24 min-h-screen relative overflow-hidden">
      {/* Sidebar */}
      <aside className={`border-r border-gray-100 bg-white/70 backdrop-blur-2xl shadow-xl relative z-20 flex flex-col transition-all duration-500 ease-in-out ${selectedChat ? 'hidden md:flex' : 'flex'} ${sidebarCollapsed ? 'w-24' : 'w-full md:w-96'}`}>
        {/* User Info & Toggle */}
        <div className="p-6 border-b border-gray-50 bg-white/40">
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && (
              <h2 className="text-2xl font-black text-[#2D3142] tracking-tight flex items-center gap-3">
                <div className="p-2 bg-[#2D3142] rounded-xl text-white">
                  <Brain className="w-5 h-5" />
                </div>
                Sanctuary
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-xl transition-all ${sidebarCollapsed ? 'mx-auto bg-[#2D3142] text-white' : 'text-[#4A4E69]/40 hover:text-[#2D3142] hover:bg-gray-100'}`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Tab Switcher / Support Button (Expanded) */}
          {!sidebarCollapsed && (
            isProfessional ? (
              <div className="flex p-1 bg-gray-100/50 rounded-2xl">
                <button
                  onClick={() => setViewMode('chats')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all ${viewMode === 'chats' ? 'bg-white shadow-md text-[#2D3142]' : 'text-[#4A4E69]/50 hover:text-[#4A4E69]'}`}
                >
                  Chats
                </button>
                <button
                  onClick={() => setViewMode('requests')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 ${viewMode === 'requests' ? 'bg-white shadow-md text-[#2D3142]' : 'text-[#4A4E69]/50 hover:text-[#4A4E69]'}`}
                >
                  Requests {requests.length > 0 && `(${requests.length})`}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {!myRequest || myRequest.status === 'rejected' ? (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full py-3.5 bg-[#2D3142] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#4A4E69] transition-all flex items-center justify-center gap-3"
                  >
                    <Plus className="w-4 h-4" />
                    Request Support
                  </button>
                ) : (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-700">Support Status</span>
                    </div>
                    <p className="text-xs text-indigo-900 font-medium truncate">
                      {myRequest.status === 'pending' ? 'Request Pending...' : 'Secure Connection Active'}
                    </p>
                  </div>
                )}
              </div>
            )
          )}

          {/* Collapsed Icons */}
          {sidebarCollapsed && (
            <div className="flex flex-col gap-4 items-center">
              {isProfessional ? (
                <>
                  <button
                    onClick={() => setViewMode('chats')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'chats' ? 'bg-[#2D3142] text-white shadow-lg' : 'text-[#4A4E69]/30 hover:bg-gray-100'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('requests')}
                    className={`p-3 rounded-xl transition-all relative ${viewMode === 'requests' ? 'bg-[#2D3142] text-white shadow-lg' : 'text-[#4A4E69]/30 hover:bg-gray-100'}`}
                  >
                    <Users className="w-5 h-5" />
                    {requests.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="p-3 bg-[#2D3142] text-white rounded-xl shadow-lg hover:bg-[#4A4E69] transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
          {viewMode === 'chats' ? (
            <div className="space-y-2">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 opacity-40">
                  <div className="w-10 h-10 border-4 border-[#2D3142] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing...</p>
                </div>
              ) : sortedChats.length === 0 ? (
                <div className="py-20 text-center px-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-6 h-6 text-gray-200" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2D3142] mb-2 tracking-tight">No Active Sanctuary</h3>
                  {!sidebarCollapsed && (
                    <p className="text-xs text-[#4A4E69]/40 leading-relaxed font-light font-sans">
                      Your professional connections will appear here. Try requesting support if you haven't already.
                    </p>
                  )}
                </div>
              ) : (
                sortedChats.map((chat) => {
                  const otherUser = chat.senderId === userId ? chat.receiverId : chat.senderId;
                  const isActive = selectedChat?.id === chat.id;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleChatSelect(otherUser, chat.id)}
                      className={`w-full p-4 flex items-center gap-4 rounded-3xl transition-all duration-300 relative group ${isActive
                        ? 'bg-white shadow-xl shadow-indigo-100/50 border border-white translate-x-1'
                        : 'hover:bg-white/40'
                        } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${getAvatarColors(otherUser)} flex items-center justify-center font-bold text-white shadow-lg transition-transform group-hover:scale-110 shrink-0`}>
                        {(participants[otherUser]?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className={`font-bold truncate text-[13px] ${isActive ? 'text-[#2D3142]' : 'text-[#4A4E69]'}`}>
                                {(() => {
                                  const p = participants[otherUser];
                                  if (!p || p.loading) return "Securing...";
                                  const isDoc = ['psychiatrist', 'doctor', 'company_doctor'].includes(p.role);
                                  return isDoc ? `Doc. ${p.name}` : p.name;
                                })()}
                              </p>
                            </div>
                            <span className="text-[9px] font-bold text-[#4A4E69]/30 uppercase tracking-tighter shrink-0">
                              {formatTime(chat.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-[11px] truncate ${isActive ? 'text-[#4A4E69]' : 'text-[#4A4E69]/40'}`}>
                            {chat.lastMessage || 'Begin transmission...'}
                          </p>
                        </div>
                      )}

                      {sidebarCollapsed && isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2D3142] rounded-l-full" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="py-20 text-center px-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-6 h-6 text-gray-200" />
                  </div>
                  {!sidebarCollapsed && <p className="text-[10px] font-bold text-[#4A4E69]/40 uppercase tracking-[0.2em]">Queue Empty</p>}
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className={`p-5 bg-white rounded-[2rem] border border-gray-50 shadow-sm space-y-4 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                          {req.studentName?.charAt(0) || "S"}
                        </div>
                        {!sidebarCollapsed && (
                          <div>
                            <h4 className="text-[13px] font-bold text-[#2D3142]">{req.studentName || 'Student'}</h4>
                            <p className="text-[10px] text-[#4A4E69]/40">{new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                          New
                        </div>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <p className="text-[11px] text-[#4A4E69] leading-relaxed bg-[#F9FBFF] p-3 rounded-2xl border border-gray-50 italic">
                          "{req.message}"
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleRequestAction(req.id, 'accept')}
                            className="bg-[#2D3142] text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#4A4E69] transition-all flex items-center justify-center gap-2"
                          >
                            {actionLoading === req.id ? '...' : (
                              <><CheckCircle className="w-3 h-3" /> Accept</>
                            )}
                          </button>
                          <button
                            disabled={actionLoading === req.id}
                            onClick={() => handleRequestAction(req.id, 'reject')}
                            className="bg-gray-100 text-[#4A4E69] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-3 h-3" /> Decline
                          </button>
                        </div>
                      </>
                    )}
                    {sidebarCollapsed && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Conversation Hub */}
      <section className={`flex-1 relative z-10 flex flex-col h-[calc(100vh-96px)] transition-all duration-300 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {
          selectedChat ? (
            <ChatRoom
              key={selectedChat.id}
              chatId={selectedChat.id}
              userId={userId}
              otherUserId={selectedChat.otherUserId}
              otherUserName={(() => {
                const p = participants[selectedChat.otherUserId];
                if (!p) return null;
                const isDoc = ['psychiatrist', 'doctor', 'company_doctor'].includes(p.role);
                return isDoc ? `Doc. ${p.name}` : p.name;
              })()}
              userRole={userRole}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
              <div className="w-32 h-32 bg-white/50 backdrop-blur-3xl rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-white">
                <Brain className="w-12 h-12 text-[#2D3142] opacity-10" />
              </div>
              <h2 className="text-2xl font-black text-[#2D3142] mb-4 tracking-tighter">Sanctuary Awaits</h2>
              <p className="text-sm text-[#4A4E69]/40 leading-relaxed font-light max-w-sm">
                Select a professional transmission from the sidebar to engage in your secure mental wellness sanctuary.
              </p>
            </div>
          )}
      </section>

      {/* Request Form Modal (Student) */}
      {
        showRequestForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#2D3142]/90 backdrop-blur-xl" onClick={() => setShowRequestForm(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-white/20">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                  <Send className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-[#2D3142] tracking-tighter mb-2">Request Sync</h2>
                <p className="text-sm text-[#4A4E69]/50 font-light">Describe your current state to connect with a professional.</p>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4A4E69]/40 ml-1">Transmission Reason</label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full bg-[#F9FBFF] border border-gray-100 rounded-[2rem] p-6 text-sm text-[#2D3142] placeholder:text-[#4A4E69]/30 focus:bg-white focus:border-indigo-200 outline-none transition-all min-h-[160px] resize-none"
                    placeholder="Briefly share what's on your mind..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-[#4A4E69]/40 hover:text-[#2D3142] transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-[#2D3142] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#4A4E69] transition-all"
                  >
                    {loading ? 'Dispatching...' : 'Initiate Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default MyChats;