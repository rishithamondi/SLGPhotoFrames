import { db, pool } from '../db';
import { productImages } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function runMigration() {
  console.log('🏁 Starting Cloudinary Image Migration...');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are missing in .env file!');
  }

  // 1. Fetch all product image records
  const allImages = await db.select().from(productImages);
  console.log(`🔍 Found ${allImages.length} image records in the database.`);

  // 2. Create backup file before doing any modifications
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupPath = path.join(backupDir, `backup-product-images-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allImages, null, 2));
  console.log(`💾 Pre-migration backup saved to: ${backupPath}`);

  let successCount = 0;
  let skipCount = 0;
  let failureCount = 0;
  const logs: string[] = [];

  // 3. Process each image record
  for (let i = 0; i < allImages.length; i++) {
    const record = allImages[i];
    const currentUrl = record.imageUrl;

    const logPrefix = `[Image ${i + 1}/${allImages.length} | ID: ${record.id}]`;

    // Skip already uploaded images
    if (currentUrl.startsWith('http://res.cloudinary.com') || currentUrl.startsWith('https://res.cloudinary.com')) {
      const msg = `${logPrefix} Already hosted on Cloudinary: ${currentUrl}. Skipping.`;
      console.log(msg);
      logs.push(msg);
      skipCount++;
      continue;
    }

    // Skip invalid / placeholders
    if (currentUrl === '/placeholder.svg' || !currentUrl) {
      const msg = `${logPrefix} Image is placeholder. Skipping.`;
      console.log(msg);
      logs.push(msg);
      skipCount++;
      continue;
    }

    // Resolve relative path to absolute local path
    const cleanRelativePath = currentUrl.startsWith('/') ? currentUrl.slice(1) : currentUrl;
    const absoluteLocalPath = path.join(process.cwd(), 'public', cleanRelativePath);

    if (!fs.existsSync(absoluteLocalPath)) {
      const msg = `${logPrefix} Local file not found at: ${absoluteLocalPath}. Skipping.`;
      console.error(msg);
      logs.push(msg);
      failureCount++;
      continue;
    }

    try {
      console.log(`${logPrefix} Uploading local file: ${absoluteLocalPath} to Cloudinary...`);
      const uploadResult = await cloudinary.uploader.upload(absoluteLocalPath, {
        folder: 'slg-photoframes/products',
        resource_type: 'image'
      });

      const cloudinaryUrl = uploadResult.secure_url;
      const successMsg = `${logPrefix} Uploaded successfully. CDN URL: ${cloudinaryUrl}`;
      console.log(successMsg);
      logs.push(successMsg);

      // Update database record
      await db.update(productImages)
        .set({ imageUrl: cloudinaryUrl })
        .where(eq(productImages.id, record.id));

      successCount++;
    } catch (uploadErr: any) {
      const errDetail = uploadErr?.message || uploadErr?.error?.message || (uploadErr && typeof uploadErr === 'object' ? JSON.stringify(uploadErr) : String(uploadErr));
      const errorMsg = `${logPrefix} Failed to upload: ${errDetail}`;
      console.error(errorMsg);
      logs.push(errorMsg);
      failureCount++;
    }
  }

  const summary = {
    success: true,
    total: allImages.length,
    migrated: successCount,
    skipped: skipCount,
    failed: failureCount,
    backupFile: backupPath,
    details: logs
  };

  console.log('\n=========================================');
  console.log('🏁 Migration completed.');
  console.log(`✅ Successfully Migrated: ${successCount}`);
  console.log(`⏩ Skipped: ${skipCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log('=========================================');

  return summary;
}

// Support running the script directly via CLI tsx
const isMain = process.argv[1] && (
  process.argv[1].endsWith('migrate-images-to-cloudinary.ts') ||
  process.argv[1].endsWith('migrate-images-to-cloudinary')
);

if (isMain) {
  runMigration()
    .then(() => {
      console.log('Closing database connection pool.');
      return pool.end();
    })
    .catch((err) => {
      console.error('Migration CLI failure:', err);
      process.exit(1);
    });
}
