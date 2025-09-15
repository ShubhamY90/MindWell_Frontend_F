import React, { useEffect, useMemo, useState } from "react";
import { db } from "../context/firebase/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import ChatRoom from "./ChatRoom";

function MyChats({ userId }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const qSender = query(collection(db, "chats"), where("senderId", "==", userId));
    const qReceiver = query(collection(db, "chats"), where("receiverId", "==", userId));

    const merge = (docs) => docs.map(d => ({ id: d.id, ...d.data() }));

    // Combine both queries into a single state update to avoid race conditions
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

  // Function to find or create a chat
  const findOrCreateChat = async (otherUserId) => {
    // First, check if a chat already exists between these users
    const existingChat = chats.find(chat => 
      (chat.senderId === userId && chat.receiverId === otherUserId) ||
      (chat.senderId === otherUserId && chat.receiverId === userId)
    );

    if (existingChat) {
      return existingChat;
    }

    // If no chat exists, create a new one
    try {
      const newChatRef = doc(collection(db, "chats"));
      const newChatData = {
        senderId: userId,
        receiverId: otherUserId,
        lastMessage: "",
        lastMessageAt: new Date(),
        createdAt: new Date()
      };
      
      await setDoc(newChatRef, newChatData);
      
      const newChat = {
        id: newChatRef.id,
        ...newChatData
      };

      // Optimistically update the chats state
      setChats(prevChats => {
        const exists = prevChats.some(chat => chat.id === newChat.id);
        return exists ? prevChats : [...prevChats, newChat];
      });

      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  const handleChatSelect = async (otherUserId) => {
    try {
      const chat = await findOrCreateChat(otherUserId);
      if (chat) {
        setSelectedChat({
          id: chat.id,
          otherUserId: otherUserId,
          senderId: chat.senderId,
          receiverId: chat.receiverId
        });
      }
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  // Clear selected chat if it's no longer in the chats list
  useEffect(() => {
    if (selectedChat && chats.length > 0) {
      const chatExists = chats.some(chat => chat.id === selectedChat.id);
      if (!chatExists) {
        setSelectedChat(null);
      }
    }
  }, [chats, selectedChat]);

  const sortedChats = useMemo(() => {
    const getTime = (v) => {
      if (!v) return 0;
      if (typeof v?.toDate === 'function') return v.toDate().getTime();
      try { return new Date(v).getTime(); } catch { return 0; }
    };
    return [...chats].sort((a, b) => getTime(b.lastMessageAt) - getTime(a.lastMessageAt));
  }, [chats]);

  const formatTime = (v) => {
    if (!v) return '';
    const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(v);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarColors = (userId) => {
    const colors = [
      'bg-gradient-to-br from-violet-500 to-purple-600',
      'bg-gradient-to-br from-blue-500 to-indigo-600',
      'bg-gradient-to-br from-emerald-500 to-teal-600',
      'bg-gradient-to-br from-amber-500 to-orange-600',
      'bg-gradient-to-br from-rose-500 to-pink-600',
      'bg-gradient-to-br from-cyan-500 to-blue-600',
    ];
    const hash = userId?.split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24 min-h-[calc(100vh-96px)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="font-bold text-xl text-slate-800">Conversations</h2>
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {loading && (
            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
              <p className="text-slate-500 text-sm font-medium">Loading conversations...</p>
            </div>
          )}
          
          {!loading && sortedChats.length === 0 && (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m0-8V4a2 2 0 012-2h4a2 2 0 012 2v4m0 0v8a2 2 0 01-2 2H9l-4 4v-4H3a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                </svg>
              </div>
              <div>
                <p className="text-slate-600 font-medium">No conversations yet</p>
                <p className="text-slate-400 text-sm">Start a new chat to begin messaging</p>
              </div>
            </div>
          )}

          <div className="space-y-1 p-2">
            {sortedChats.map((chat, index) => {
              const otherUser = chat.senderId === userId ? chat.receiverId : chat.senderId;
              const isActive = selectedChat?.id === chat.id;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(otherUser)}
                  className={`w-full text-left p-4 flex items-center gap-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md border border-indigo-200/50 transform scale-[1.02]' 
                      : 'hover:bg-white/60 hover:shadow-sm hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getAvatarColors(otherUser)} flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-white transition-transform group-hover:scale-110`}>
                    {String(otherUser || '?').charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold truncate ${isActive ? 'text-slate-800' : 'text-slate-700'}`}>
                        {otherUser}
                      </p>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`text-xs font-medium block ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm truncate ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                      {chat.lastMessage || 'Start a new conversation...'}
                    </p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Conversation Area */}
      <section className="flex-1 hidden md:flex flex-col min-h-[calc(100vh-96px)] relative z-10">
        {selectedChat ? (
          <ChatRoom
            key={selectedChat.id} // Add key prop to force re-render when chat changes
            chatId={selectedChat.id}
            userId={userId}
            otherUserId={selectedChat.otherUserId}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-white/50 to-slate-50/50 backdrop-blur-sm">
            <div className="text-center space-y-6 p-8">
              {/* Illustration */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-xl">
                  <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Text content */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Choose a conversation</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Select a chat from the sidebar to start messaging and stay connected with your conversations.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="flex justify-center space-x-2 opacity-40">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyChats;