import { pgTable, text, serial, uuid, numeric, boolean, timestamp, pgEnum, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Product Status Enum
export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived', 'inactive']);

// Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(), // e.g. 'photo-frames'
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  smallTitle: text('small_title').notNull(),
  name: text('name'),
  description: text('description'),
  shortDescription: text('short_description'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'restrict' }).notNull(),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  customizable: boolean('customizable').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  popular: boolean('popular').default(false).notNull(),
  handmade: boolean('handmade').default(false).notNull(),
  frameType: text('frame_type'),
  orientation: text('orientation'), // 'Portrait' | 'Landscape'
  materials: text('materials').array(),
  tags: text('tags').array(),
  status: productStatusEnum('status').default('draft').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  aiGeneratedAt: timestamp('ai_generated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('slug_idx').on(table.slug),
    categoryIdx: index('category_idx').on(table.categoryId),
    priceIdx: index('price_idx').on(table.basePrice),
    featuredIdx: index('featured_idx').on(table.featured),
    popularIdx: index('popular_idx').on(table.popular),
    statusIdx: index('status_idx').on(table.status),
  };
});

// Product Images Table
export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Product Sizes Table
export const productSizes = pgTable('product_sizes', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sizeName: text('size_name').notNull(), // e.g. '6x8 inches'
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admins Table
export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Drizzle Relations ---

export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  sizes: many(productSizes),
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productSizeRelations = relations(productSizes, ({ one }) => ({
  product: one(products, {
    fields: [productSizes.productId],
    references: [products.id],
  }),
}));
