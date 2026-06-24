import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit max connections to prevent Neon connection limit exhaustion during hot-reloads
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout after 5 seconds if connection cannot be established
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client:', err);
});

/*
// Startup database connection test & image path diagnostics
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection test failed:', err.message || err);
  } else {
    console.log('✅ Database connection test succeeded at:', res.rows[0].now);
    
    // Diagnostic query to check local vs Cloudinary URLs in the database
    pool.query("SELECT image_url FROM product_images", (imgErr, imgRes) => {
      if (imgErr) {
        console.error('❌ Database image query failed:', imgErr.message || imgErr);
      } else {
        const total = imgRes.rows.length;
        const cloudinaryCount = imgRes.rows.filter(row => row.image_url?.includes('cloudinary.com')).length;
        const localCount = imgRes.rows.filter(row => row.image_url?.startsWith('/products/')).length;
        const placeholderCount = imgRes.rows.filter(row => row.image_url === '/placeholder.svg').length;
        
        console.log(`📊 Image URL Stats in Database:`);
        console.log(`   - Total Images: ${total}`);
        console.log(`   - Cloudinary URLs: ${cloudinaryCount}`);
        console.log(`   - Legacy Local Paths: ${localCount}`);
        console.log(`   - Placeholders: ${placeholderCount}`);
        console.log(`   - Other: ${total - cloudinaryCount - localCount - placeholderCount}`);
      }
    });
  }
});
*/

export const db = drizzle(pool, { schema });
export { pool };

