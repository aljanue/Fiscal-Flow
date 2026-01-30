import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories, timeUnits } from '../../src/db/schema';

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

  console.log('📂 Creating categories...');
  await db.insert(categories).values([
    { name: 'Comida', slug: 'comida', icon: '🍔' },
    { name: 'Transporte', slug: 'transporte', icon: '🚌' },
    { name: 'Casa', slug: 'casa', icon: '🏠' },
    { name: 'Ocio', slug: 'ocio', icon: '🎉' },
    { name: 'Salud', slug: 'salud', icon: '🏥' },
    { name: 'Suscripciones', slug: 'subs', icon: '💳' },
    { name: 'Supermercado', slug: 'supermercado', icon: '🛒' },
    { name: 'Ropa', slug: 'ropa', icon: '👕' },
    { name: 'Educación', slug: 'educacion', icon: '📚' },
    { name: 'Regalos', slug: 'regalos', icon: '🎁' },
    { name: 'Mascotas', slug: 'mascotas', icon: '🐶' },
    { name: 'Viajes', slug: 'viajes', icon: '✈️' },
    { name: 'Tecnología', slug: 'tecnologia', icon: '💻' },
    { name: 'Vehículo', slug: 'vehiculo', icon: '🚗' },
    { name: 'Otros', slug: 'otros', icon: '📦' },
  ]).onConflictDoNothing();

  console.log('✅ Database ready! You can now use the API.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error in seeding:', err);
  process.exit(1);
});