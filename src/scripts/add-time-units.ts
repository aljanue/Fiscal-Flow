import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { timeUnits } from '../db/schema';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('❌ DATABASE_URL is missing in environment variables');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log('🌱 Starting data seeding...');

  console.log('⏳ Creating time units...');
  await db.insert(timeUnits).values([
    { name: 'Días', value: 'days' },
    { name: 'Semanas', value: 'weeks' },
    { name: 'Meses', value: 'months' },
    { name: 'Años', value: 'years' },
  ]).onConflictDoNothing();

  console.log('✅ Database ready! You can now use the API.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error in seeding:', err);
  process.exit(1);
});