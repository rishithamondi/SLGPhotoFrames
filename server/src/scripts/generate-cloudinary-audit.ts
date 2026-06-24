import { db, pool } from '../db';
import { productImages, products } from '../db/schema';
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

const extractPublicId = (url: string): string | null => {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  // Match standard Cloudinary URLs: /image/upload/(v12345/)?(public_id)
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
};

async function runAudit() {
  console.log('🏁 Starting Cloudinary Asset Audit...');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are missing in .env file!');
  }

  try {
    // 1. Fetch all product image records from the database
    console.log('📥 Fetching product images from database...');
    const dbImages = await db
      .select({
        imageId: productImages.id,
        imageUrl: productImages.imageUrl,
        productId: products.id,
        productName: products.name,
        productSmallTitle: products.smallTitle,
      })
      .from(productImages)
      .leftJoin(products, eq(productImages.productId, products.id));

    console.log(`🔍 Found ${dbImages.length} image records in the database.`);

    // Map database URLs to public_ids and track duplicates
    const dbPublicIdToRecord: Record<string, typeof dbImages[0]> = {};
    const dbReferencedPublicIds = new Set<string>();
    const duplicateReferences: Array<{ publicId: string; url: string; productName: string; records: string[] }> = [];
    const publicIdToImageIds: Record<string, string[]> = {};

    for (const record of dbImages) {
      if (record.imageUrl) {
        const publicId = extractPublicId(record.imageUrl);
        if (publicId) {
          dbReferencedPublicIds.add(publicId);
          if (!publicIdToImageIds[publicId]) {
            publicIdToImageIds[publicId] = [];
            dbPublicIdToRecord[publicId] = record;
          } else {
            // Track duplicates
            publicIdToImageIds[publicId].push(record.imageId);
          }
        }
      }
    }

    // Identify duplicates in database
    for (const [publicId, ids] of Object.entries(publicIdToImageIds)) {
      if (ids.length > 1) {
        const record = dbPublicIdToRecord[publicId];
        duplicateReferences.push({
          publicId,
          url: record?.imageUrl || '',
          productName: record?.productName || record?.productSmallTitle || 'Unknown Product',
          records: ids,
        });
      }
    }

    // 2. Fetch all Cloudinary assets under prefix 'slg-photoframes/'
    console.log('☁️ Fetching assets list from Cloudinary...');
    let cloudinaryAssets: any[] = [];
    let nextCursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const response: any = await new Promise((resolve, reject) => {
        cloudinary.api.resources(
          {
            type: 'upload',
            prefix: 'slg-photoframes/',
            max_results: 500,
            next_cursor: nextCursor,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      if (response && response.resources) {
        cloudinaryAssets = cloudinaryAssets.concat(response.resources);
        nextCursor = response.next_cursor;
        hasMore = !!nextCursor;
      } else {
        hasMore = false;
      }
    }

    console.log(`🔍 Found ${cloudinaryAssets.length} assets on Cloudinary under 'slg-photoframes/'.`);

    // 3. Perform comparison audits
    const referencedAssets: any[] = [];
    const unreferencedAssets: any[] = [];
    const sampleDemoAssets: any[] = [];

    const cloudinaryPublicIds = new Set<string>();

    for (const asset of cloudinaryAssets) {
      const publicId = asset.public_id;
      cloudinaryPublicIds.add(publicId);

      // Check if it is a sample or demo asset
      const isSample = publicId.includes('sample') || publicId.includes('demo') || publicId.includes('test');
      if (isSample) {
        sampleDemoAssets.push(asset);
      }

      if (dbReferencedPublicIds.has(publicId)) {
        referencedAssets.push({
          ...asset,
          dbRecord: dbPublicIdToRecord[publicId],
        });
      } else {
        unreferencedAssets.push(asset);
      }
    }

    // Identify assets referenced in the DB but missing from Cloudinary
    const missingCloudinaryAssets: any[] = [];
    for (const publicId of dbReferencedPublicIds) {
      if (!cloudinaryPublicIds.has(publicId)) {
        missingCloudinaryAssets.push({
          publicId,
          dbRecord: dbPublicIdToRecord[publicId],
        });
      }
    }

    // 4. Generate report markdown
    const reportPath = path.join(process.cwd(), 'cloudinary-audit-report.md');
    const reportLines: string[] = [];

    reportLines.push('# Cloudinary Asset Audit Report\n');
    reportLines.push(`Report Generated On: ${new Date().toLocaleString()}\n`);

    reportLines.push('## Summary Statistics\n');
    reportLines.push(`* **Total Database Image Records**: ${dbImages.length}`);
    reportLines.push(`* **Distinct Cloudinary Public IDs in Database**: ${dbReferencedPublicIds.size}`);
    reportLines.push(`* **Total Cloudinary Assets (in \`slg-photoframes/\`)**: ${cloudinaryAssets.length}`);
    reportLines.push(`* **Active Referenced Assets (In Cloudinary & DB)**: ${referencedAssets.length}`);
    reportLines.push(`* **Orphaned Assets (In Cloudinary, NOT in DB)**: ${unreferencedAssets.length}`);
    reportLines.push(`* **Missing Assets (Referenced in DB, NOT in Cloudinary)**: ${missingCloudinaryAssets.length}`);
    reportLines.push(`* **Duplicate Database Image References**: ${duplicateReferences.length}`);
    reportLines.push(`* **Sample/Demo Assets**: ${sampleDemoAssets.length}\n`);

    reportLines.push('## 1. Referenced Assets (Active)\n');
    if (referencedAssets.length === 0) {
      reportLines.push('None found.\n');
    } else {
      reportLines.push('| Product Name | Product ID | Cloudinary Public ID | Secure URL | Created At | Size (KB) |');
      reportLines.push('| :--- | :--- | :--- | :--- | :--- | :--- |');
      referencedAssets.slice(0, 100).forEach(asset => {
        const dbRec = asset.dbRecord;
        const prodName = dbRec?.productName || dbRec?.productSmallTitle || 'Unknown';
        const sizeKB = (asset.bytes / 1024).toFixed(1);
        reportLines.push(`| ${prodName} | ${dbRec?.productId || 'N/A'} | \`${asset.public_id}\` | [Link](${asset.secure_url}) | ${asset.created_at} | ${sizeKB} |`);
      });
      if (referencedAssets.length > 100) {
        reportLines.push(`\n*(Showing first 100 of ${referencedAssets.length} active records)*\n`);
      } else {
        reportLines.push('\n');
      }
    }

    reportLines.push('## 2. Orphaned Assets (Unreferenced on Cloudinary)\n');
    reportLines.push('> [!NOTE]\n> These files are stored on Cloudinary under `slg-photoframes/` but are **not** referenced by any database record. They can be safely deleted if not needed elsewhere.\n');
    if (unreferencedAssets.length === 0) {
      reportLines.push('No orphaned assets found. Clean configuration! 🎉\n');
    } else {
      reportLines.push('| Cloudinary Public ID | Format | Size (KB) | Secure URL | Created At |');
      reportLines.push('| :--- | :--- | :--- | :--- | :--- |');
      unreferencedAssets.forEach(asset => {
        const sizeKB = (asset.bytes / 1024).toFixed(1);
        reportLines.push(`| \`${asset.public_id}\` | ${asset.format} | ${sizeKB} | [Link](${asset.secure_url}) | ${asset.created_at} |`);
      });
      reportLines.push('\n');
    }

    reportLines.push('## 3. Missing Assets (Referenced in DB, missing from Cloudinary)\n');
    reportLines.push('> [!WARNING]\n> These public IDs are set in your database but the files could not be found on your Cloudinary storage. These will render as broken links on the website.\n');
    if (missingCloudinaryAssets.length === 0) {
      reportLines.push('No missing assets found! All referenced assets exist on Cloudinary. ✅\n');
    } else {
      reportLines.push('| Product Name | Product ID | Expected Public ID | DB Image URL |');
      reportLines.push('| :--- | :--- | :--- | :--- |');
      missingCloudinaryAssets.forEach(asset => {
        const dbRec = asset.dbRecord;
        const prodName = dbRec?.productName || dbRec?.productSmallTitle || 'Unknown';
        reportLines.push(`| ${prodName} | ${dbRec?.productId || 'N/A'} | \`${asset.publicId}\` | \`${dbRec?.imageUrl}\` |`);
      });
      reportLines.push('\n');
    }

    reportLines.push('## 4. Duplicate Database References\n');
    reportLines.push('> [!IMPORTANT]\n> These entries are records in your `product_images` table referencing the same Cloudinary image. Check if they are intended (e.g. reused layout images) or duplicates.\n');
    if (duplicateReferences.length === 0) {
      reportLines.push('No duplicate database image references found. ✅\n');
    } else {
      reportLines.push('| Product Name | Public ID | DB Records (Image UUIDs) |');
      reportLines.push('| :--- | :--- | :--- |');
      duplicateReferences.forEach(dup => {
        reportLines.push(`| ${dup.productName} | \`${dup.publicId}\` | ${dup.records.map(id => `\`${id.slice(0, 8)}...\``).join(', ')} |`);
      });
      reportLines.push('\n');
    }

    reportLines.push('## 5. Sample/Demo Assets\n');
    if (sampleDemoAssets.length === 0) {
      reportLines.push('No sample/demo assets found.\n');
    } else {
      reportLines.push('| Cloudinary Public ID | Format | Size (KB) | Secure URL |');
      reportLines.push('| :--- | :--- | :--- | :--- |');
      sampleDemoAssets.forEach(asset => {
        const sizeKB = (asset.bytes / 1024).toFixed(1);
        reportLines.push(`| \`${asset.public_id}\` | ${asset.format} | ${sizeKB} | [Link](${asset.secure_url}) |`);
      });
      reportLines.push('\n');
    }

    const reportContent = reportLines.join('\n');
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n🎉 Audit Completed. Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Audit script failed:', error);
  } finally {
    await pool.end();
  }
}

runAudit();
