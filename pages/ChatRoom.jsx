import React, { useEffect, useState } from "react";
import { db } from "../context/firebase/firebase";
import { collection, query, orderBy, onSnapshot, where, getDocs, addDoc } from "firebase/firestore";
import { sendMessage } from "../src/utils/sendMessage";

function ChatRoom({ chatId, userId, otherUserId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [resolvedChatId, setResolvedChatId] = useState(chatId || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resolve existing chat id if not provided
  useEffect(() => {
    let isCancelled = false;
    async function findChat() {
      if (resolvedChatId || !userId || !otherUserId) return;
      try {
        setLoading(true);
        const q1 = query(
          collection(db, "chats"),
          where("senderId", "==", userId),
          where("receiverId", "==", otherUserId)
        );
        const q2 = query(
          collection(db, "chats"),
          where("senderId", "==", otherUserId),
          where("receiverId", "==", userId)
        );
        const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const match = !s1.empty ? s1.docs[0] : (!s2.empty ? s2.docs[0] : null);
        if (!isCancelled && match) {
          setResolvedChatId(match.id);
        } else if (!isCancelled && userRole === 'psychiatrist') {
          // Auto-create chat when psychiatrist opens an accepted request without prior chat
          const newChatRef = await addDoc(collection(db, "chats"), {
            senderId: userId,
            receiverId: otherUserId,
            lastMessage: '',
            lastMessageAt: new Date()
          });
          setResolvedChatId(newChatRef.id);
        }
      } catch (e) {
        if (!isCancelled) setError("Failed to load chat");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    findChat();
    return () => { isCancelled = true; };
  }, [resolvedChatId, userId, otherUserId, userRole]);

  // Subscribe to messages if we have an id
  useEffect(() => {
    if (!resolvedChatId) return;
    const q = query(
      collection(db, "chats", resolvedChatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [resolvedChatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessage(userId, otherUserId, newMessage, { allowCreate: userRole === 'psychiatrist' });
      setNewMessage("");
      setError("");
      // If chat was just created (e.g., psychiatrist initiated), resolve it now
      if (!resolvedChatId) {
        try {
          const qAny = query(collection(db, "chats"), where("senderId", "in", [userId, otherUserId]));
          const snap = await getDocs(qAny);
          let foundId = null;
          snap.forEach(d => {
            const data = d.data();
            if (
              (data.senderId === userId && data.receiverId === otherUserId) ||
              (data.senderId === otherUserId && data.receiverId === userId)
            ) {
              foundId = d.id;
            }
          });
          if (foundId) setResolvedChatId(foundId);
        } catch (_) {}
      }
    } catch (e) {
      setError(e?.message || "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Loading/Empty State */}
        {!resolvedChatId && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading chat...
                  </span>
                ) : (
                  "No chat yet. Psychiatrists can send the first message after accepting a request."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === userId ? "justify-end" : "justify-start"
            } ${index === 0 ? 'mt-4' : ''}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                msg.senderId === userId 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12" 
                  : "bg-white text-gray-800 mr-12 border border-gray-100"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm placeholder-gray-400 text-gray-900 transition-all duration-200"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;