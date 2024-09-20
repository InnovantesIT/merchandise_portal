"use server"
import * as crypto from 'crypto';

const generateKey = (): string => {
  return crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits
};

// Generate and log the key
const secretKey = generateKey();
console.log('Generated Secret Key:', secretKey);

 export default generateKey;