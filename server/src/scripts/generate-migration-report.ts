import { db, pool } from '../db';
import { productImages, products } from '../db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

async function generateReport() {
  console.log('📊 Generating Cloudinary Image Migration Report...');

  try {
    // Query images joined with products
    const imageRecords = await db
      .select({
        imageId: productImages.id,
        imageUrl: productImages.imageUrl,
        productId: products.id,
        productName: products.name,
        productSmallTitle: products.smallTitle,
      })
      .from(productImages)
      .leftJoin(products, eq(productImages.productId, products.id));

    // Filter for local paths (i.e. those not starting with http/https)
    const localImages = imageRecords.filter(
      (img) =>
        img.imageUrl &&
        !img.imageUrl.startsWith('http://') &&
        !img.imageUrl.startsWith('https://')
    );

    console.log(`\n🔍 Found ${localImages.length} unmigrated image records in the database.`);

    const reportLines: string[] = [];
    reportLines.push('# Cloudinary Image Migration Report - Unmigrated Records\n');
    reportLines.push(`Report Generated On: ${new Date().toLocaleString()}\n`);
    reportLines.push('| Product Name | Product ID | Image ID | Image URL in DB | File Exists on Disk? | Reason skipped/failed |');
    reportLines.push('| :--- | :--- | :--- | :--- | :--- | :--- |');

    for (const img of localImages) {
      const dbUrl = img.imageUrl || '';
      const cleanPath = dbUrl.startsWith('/') ? dbUrl.slice(1) : dbUrl;
      const fileFullPath = path.join(process.cwd(), 'public', cleanPath);
      const exists = fs.existsSync(fileFullPath);

      // Determine likely reason for failure/skip
      let reason = 'Unknown error during migration upload';
      if (dbUrl === '/placeholder.svg' || !dbUrl) {
        reason = 'Skipped: File is placeholder or empty';
      } else if (!exists) {
        reason = `Skipped: Local file not found at path 'public/${cleanPath}'`;
      } else {
        // Check if file is too large or has other obvious issues
        try {
          const stats = fs.statSync(fileFullPath);
          const sizeMB = stats.size / (1024 * 1024);
          if (sizeMB > 10) {
            reason = `Failed: File is too large (${sizeMB.toFixed(2)} MB), exceeds 10MB limit`;
          } else {
            // Check file type/extension
            const ext = path.extname(fileFullPath).toLowerCase();
            if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
              reason = `Failed: Unsupported file extension (${ext})`;
            }
          }
        } catch (err) {
          reason = `Error reading file stats: ${(err as Error).message}`;
        }
      }

      const prodName = img.productName || img.productSmallTitle || 'Unknown Product';
      const prodId = img.productId || 'N/A';
      const imgId = img.imageId;

      reportLines.push(
        `| ${prodName} | ${prodId} | ${imgId} | \`${dbUrl}\` | ${exists ? '✅ Yes' : '❌ No'} | ${reason} |`
      );
    }

    const reportContent = reportLines.join('\n');
    fs.writeFileSync(path.join(process.cwd(), 'migration-report.md'), reportContent);
    console.log(`\n✅ Report successfully saved to: ${path.join(process.cwd(), 'migration-report.md')}\n`);
    console.log(reportContent);

  } catch (error) {
    console.error('❌ Failed to generate migration report:', error);
  } finally {
    await pool.end();
  }
}

generateReport();
