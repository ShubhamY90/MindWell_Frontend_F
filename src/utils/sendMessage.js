import { db } from "../../context/firebase/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { API_BASE_URL } from "./api";

export async function sendMessage(senderId, receiverId, text, options = {}) {
  if (!text.trim()) return;

  // Guard: ensure a request has been accepted between these two users
  // We assume receiverId is the other participant (either psychiatrist or student email)
  try {
    const checkUrl = `${API_BASE_URL}/api/request/college/${encodeURIComponent('noop')}`;
    // No direct endpoint to validate acceptance by pair exists yet.
    // We'll rely on chats being created on acceptance: if no chat exists, block first send and ask psychiatrist to accept.
  } catch (_) {}

  // Step 1: check if a chat already exists between these two users
  const chatQuery = query(collection(db, "chats"), where("senderId", "in", [senderId, receiverId]));
  const snapshot = await getDocs(chatQuery);

  let chatDoc = null;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (
      (data.senderId === senderId && data.receiverId === receiverId) ||
      (data.senderId === receiverId && data.receiverId === senderId)
    ) {
      chatDoc = { id: docSnap.id, ...data };
    }
  });

  // Step 2: If no chat, block sending unless the sender is a psychiatrist
  if (!chatDoc) {
    const isPsychiatrist = options.allowCreate === true || senderId?.includes('@');
    if (!isPsychiatrist) {
      throw new Error('Chat not available. Please wait until a psychiatrist accepts your request.');
    }
    const newChatRef = await addDoc(collection(db, "chats"), {
      senderId,
      receiverId,
      lastMessage: text,
      lastMessageAt: new Date()
    });
    chatDoc = { id: newChatRef.id };
  } else {
    // update chat with last message
    await updateDoc(doc(db, "chats", chatDoc.id), {
      lastMessage: text,
      lastMessageAt: new Date()
    });
  }

  // Step 3: Add message to messages subcollection
  await addDoc(collection(db, "chats", chatDoc.id, "messages"), {
    senderId,
    receiverId,
    text,
    timestamp: new Date()
  });
}
