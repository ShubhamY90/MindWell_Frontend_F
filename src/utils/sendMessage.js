import { getAuth } from "firebase/auth";
import { encryptText } from "./encryption";
import { API_BASE_URL } from "./api";

export async function sendMessage(senderId, receiverId, text, options = {}) {
  if (!text.trim()) return;

  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) throw new Error("User not authenticated");

  const idToken = await currentUser.getIdToken();

  // 1. Derive shared symmetric key (password) via sorting UIDs
  const sharedPassword = [senderId, receiverId].sort().join("_");

  // 2. Encrypt the text payload
  const encryptedPayload = await encryptText(text.trim(), sharedPassword);

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
      text: encryptedPayload.data,     // Send encrypted text
      iv: encryptedPayload.iv,        // Required for decryption
      salt: encryptedPayload.salt,    // Required for decryption
      options,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send message");
  }

  return data;
}
