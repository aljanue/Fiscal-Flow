import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/db';
import { users } from '@/db/schema';
import crypto from 'crypto';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex');

function encryptUserKey(userKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(userKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  } catch (error) {
    console.error('❌ Error encrypting user key:', error);
    throw new Error('❌ Encryption failed');
  }
}

function generateUserKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function addUser() {
  try {
    console.log('👤 Add new user\n');
    
    const username = await question('👤 Username: ');
    const email = await question('📧 Email (optional, press Enter to skip): ');
    
    if (!username) {
      console.log('⚠️ Username is required. Exiting.');
      process.exit(1);
    }
    
    const customKeyOption = await question('\n🔐 Use a custom key? (y/n, default: n): ');
    let userKey: string;
    
    if (customKeyOption.toLowerCase() === 'y' || customKeyOption.toLowerCase() === 'yes') {
      userKey = await question('🔑 Add your custom key: ');
      if (!userKey) {
        console.log('❌ The key cannot be empty.');
        process.exit(1);
      }
    } else {
      userKey = generateUserKey();
    }
    
    const encryptedUserKey = encryptUserKey(userKey);
    
    await db.insert(users).values({
      username,
      email: email || null,
      userKey: encryptedUserKey,
    });
    
    console.log('\n✅ User created successfully');
    console.log(`\n👤 User details:`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email || 'Not specified'}`);
    console.log(`   User Key (save in the mobile app): ${userKey}`);
    console.log(`\n⚠️ Make sure to save the User Key in your mobile app. It cannot be recovered later.`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    rl.close();
    process.exit(1);
  }
}

addUser();
