import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex');

export function encryptUserKey(userKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(userKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting user key:', error);
    throw new Error('Encryption failed');
  }
}

export function decryptUserKey(encryptedUserKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedUserKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting user key:', error);
    throw new Error('Decryption failed');
  }
}
