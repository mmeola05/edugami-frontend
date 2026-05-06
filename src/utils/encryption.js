import CryptoJS from "crypto-js";

// Deterministic Key Generation
// Mixes IDs of both users and sorts them to ensure both parties generate the same key.
// In a real production app, this should be done via Diffie-Hellman or storing keys on server.
// For this feature request (WhatsApp-like simulation), this suffices for "Client-Side Encryption".
export function generateChatKey(id1, id2) {
  const secretSalt = "EDUGAMI_SECURE_CHAT_SALT_2024";
  const ids = [String(id1), String(id2)].sort();
  return CryptoJS.SHA256(`${secretSalt}_${ids[0]}_${ids[1]}`).toString();
}

export function encryptMessage(text, key) {
  if (!text) return "";
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
}

export function decryptMessage(cipherText, key) {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption yields empty string but we had input, it failed or key is wrong.
    // However, if it's not valid UTF8, it might be legacy plain text.
    if (!originalText && cipherText.length > 0) return cipherText;
    return originalText || cipherText; // Fallback to original if empty
  } catch (e) {
    // Legacy fallback: return as is (assuming it was plain text)
    return cipherText;
  }
}
