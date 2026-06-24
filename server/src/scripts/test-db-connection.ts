import { db, pool } from '../db';
import { categories, products } from '../db/schema';

async function testConnection() {
  console.log('--- DB Connection Test ---');
  try {
    console.log('Attempting to query categories table...');
    const allCategories = await db.select().from(categories);
    console.log(`Success! Found ${allCategories.length} categories.`);
    console.log('First category:', allCategories[0]);
  } catch (err: any) {
    console.error('ERROR querying categories:', err);
  }

  try {
    console.log('Attempting to query products table...');
    const allProducts = await db.select().from(products).limit(1);
    console.log(`Success! Query returned products.`);
    console.log('First product sample:', allProducts[0]);
  } catch (err: any) {
    console.error('ERROR querying products:', err);
  }

  console.log('Closing pool...');
  await pool.end();
  console.log('Done.');
}

testConnection().catch(console.error);
