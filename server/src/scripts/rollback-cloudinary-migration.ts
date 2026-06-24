import { db, pool } from '../db';
import { productImages } from '../db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

export async function runRollback(backupFilename?: string) {
  console.log('🔙 Starting Cloudinary Migration Rollback...');
  
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    throw new Error('No backups directory found. Nothing to rollback.');
  }

  let selectedFile = backupFilename;
  
  if (!selectedFile) {
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup-product-images-') && f.endsWith('.json'));
    if (files.length === 0) {
      throw new Error('No backup JSON files found in backups directory. Nothing to rollback.');
    }
    // Sort files descending (most recent first)
    files.sort((a, b) => b.localeCompare(a));
    selectedFile = files[0];
  }

  const selectedFilePath = path.join(backupDir, selectedFile);
  console.log(`⚠️ Selected backup file to restore: ${selectedFile}`);
  
  const backupContent = fs.readFileSync(selectedFilePath, 'utf-8');
  const originalRecords = JSON.parse(backupContent);

  console.log(`⏳ Restoring ${originalRecords.length} image records...`);
  let restoreCount = 0;

  for (const record of originalRecords) {
    await db.update(productImages)
      .set({ imageUrl: record.imageUrl })
      .where(eq(productImages.id, record.id));
    
    restoreCount++;
  }

  console.log(`✅ Rollback completed successfully! Restored ${restoreCount} image records.`);
  
  return {
    success: true,
    restored: restoreCount,
    backupFile: selectedFile
  };
}

// Support running the script directly via CLI
async function cliMain() {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    console.error('❌ No backups directory found.');
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup-product-images-') && f.endsWith('.json'));
  if (files.length === 0) {
    console.error('❌ No backup JSON files found. Nothing to rollback.');
    process.exit(1);
  }

  files.sort((a, b) => b.localeCompare(a));
  console.log('\nAvailable Backups:');
  files.forEach((file, idx) => {
    console.log(`[${idx}] ${file}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
  };

  const choiceInput = await askQuestion('\nSelect the backup index to restore (default: 0): ');
  const choice = parseInt(choiceInput) || 0;

  if (choice < 0 || choice >= files.length) {
    console.error('❌ Invalid choice. Rollback aborted.');
    rl.close();
    process.exit(1);
  }

  const selectedFile = files[choice];
  const confirm = await askQuestion(`Are you absolutely sure you want to restore "${selectedFile}"? (y/N): `);
  
  rl.close();

  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Rollback cancelled.');
    process.exit(0);
  }

  try {
    const summary = await runRollback(selectedFile);
    console.log('Rollback Summary:', summary);
  } catch (error) {
    console.error('Rollback failed:', error);
  } finally {
    await pool.end();
  }
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('rollback-cloudinary-migration.ts') ||
  process.argv[1].endsWith('rollback-cloudinary-migration')
);

if (isMain) {
  cliMain();
}
