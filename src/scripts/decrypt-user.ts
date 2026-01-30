import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex');

function decryptUserKey(encryptedUserKey: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedUserKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Error decrypting user key:', error);
    throw new Error('❌ Decryption failed');
  }
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

async function decryptUser() {
  try {
    console.log('🔓 Decrypt user key\n');
    
    const username = await question('👤 Username: ');
    
    if (!username) {
      console.log('⚠️ Username is required. Exiting.');
      process.exit(1);
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    if (!user) {
      console.log(`❌ User '${username}' not found`);
      process.exit(1);
    }
    
    const decryptedKey = decryptUserKey(user.userKey);
    
    console.log('\n✅ User key decrypted successfully\n');
    console.log(`👤 User details:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email || 'Not specified'}`);
    console.log(`   Decrypted User Key: ${decryptedKey}`);
    console.log(`\n⚠️ This key is confidential. Do not share it.`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error decrypting user key:', error);
    rl.close();
    process.exit(1);
  }
}

decryptUser();
