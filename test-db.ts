import { db } from './server/db';
import { leads } from './shared/schema';

async function testDb() {
  try {
    const result = await db.select().from(leads).limit(1);
    console.log('✅ Database connection successful!', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDb();
