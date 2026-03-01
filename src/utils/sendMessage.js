import { getAuth } from "firebase/auth";
import { API_BASE_URL } from "./api";

export async function sendMessage(senderId, receiverId, text, options = {}) {
  if (!text.trim()) return;

  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) throw new Error("User not authenticated");

  const idToken = await currentUser.getIdToken();

  const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      senderId,
      receiverId,
      senderName: options.senderName || '', // New field
      receiverName: options.receiverName || '', // New field
      text: text.trim(),
      options,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message");
  }

  return data;
}
