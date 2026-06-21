import { db, pool } from '../db';
import { categories as categoriesTable, products as productsTable, productImages, productSizes, admins as adminsTable } from '../db/schema';
import { categories as staticCategories, products as staticProducts } from '../../../src/data/products';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clear existing data in reverse dependency order
    console.log('🧹 Cleaning existing database records...');
    await db.delete(productImages);
    await db.delete(productSizes);
    await db.delete(productsTable);
    await db.delete(categoriesTable);
    await db.delete(adminsTable);
    console.log('✨ Database cleared.');

    // 1b. Seed default admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@slgphotoframes.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSLG2026!';
    console.log('🔑 Seeding default admin account...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await db.insert(adminsTable).values({
      email: adminEmail.toLowerCase(),
      passwordHash: passwordHash,
    });
    console.log(`✅ Default admin seeded: ${adminEmail}`);

    // 2. Insert Categories
    console.log(`📂 Seeding ${staticCategories.length} categories...`);
    for (const cat of staticCategories) {
      await db.insert(categoriesTable).values({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image || '/placeholder.svg',
      });
    }
    console.log('✅ Categories seeded.');

    // 3. Insert Products
    console.log(`🛍️ Seeding ${staticProducts.length} products...`);
    for (const prod of staticProducts) {
      const slug = generateSlug(prod.name);
      
      // Insert product and retrieve generated UUID
      const [insertedProduct] = await db.insert(productsTable).values({
        slug,
        smallTitle: prod.name,
        name: prod.name,
        description: prod.description,
        shortDescription: prod.description.slice(0, 150) + (prod.description.length > 150 ? '...' : ''),
        categoryId: prod.category,
        basePrice: prod.basePrice.toString(),
        customizable: prod.customizable || false,
        featured: prod.featured || false,
        popular: prod.popular || false,
        handmade: prod.handmade || false,
        frameType: prod.frameType || null,
        orientation: prod.orientation || null,
        materials: prod.materials,
        tags: prod.tags,
        status: 'published',
        seoTitle: `${prod.name} | SLG Photo Frames`,
        seoDescription: prod.description.slice(0, 155),
      }).returning({ id: productsTable.id });

      const productId = insertedProduct.id;

      // Insert associated images
      if (prod.images && prod.images.length > 0) {
        for (let i = 0; i < prod.images.length; i++) {
          await db.insert(productImages).values({
            productId,
            imageUrl: prod.images[i],
            displayOrder: i,
          });
        }
      }

      // Insert associated sizes
      if (prod.sizes && prod.sizes.length > 0) {
        for (const size of prod.sizes) {
          await db.insert(productSizes).values({
            productId,
            sizeName: size.name,
            price: size.price.toString(),
          });
        }
      }
    }
    console.log('✅ Products, sizes, and images seeded.');
    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

main();
