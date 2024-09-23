import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-default-secret-key';

export const encrypt = (text: string): string => {
  const ciphertext = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  return ciphertext;
};

export const decrypt = (ciphertext: string): string => {
  try {
    if (!ciphertext) {
      throw new Error('Decryption failed: Ciphertext is empty.');
    }


    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      throw new Error('Decryption failed: Invalid ciphertext or key.');
    }

    return originalText;
  } catch (error: any) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt the data.');
  }
};
