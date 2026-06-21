import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { eq, ilike, or, and, sql, desc, asc, gte, lte } from 'drizzle-orm';
import { db } from './db';
import { categories, products, productImages, productSizes } from './db/schema';
import adminRouter from './routes/admin';

dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve local uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Register Admin API Routes
app.use('/api/admin', adminRouter);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// GET /api/categories - Retrieve all categories
app.get('/api/categories', async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products - Query catalog products with pagination, filters, search, and sorting
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const categoryFilter = req.query.category as string;
    const searchFilter = req.query.search as string;
    const sortType = req.query.sort as string; // 'price-asc' | 'price-desc' | 'newest' | 'popular'
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);

    // Build query conditions
    const conditions = [eq(products.status, 'published')];

    if (!isNaN(minPrice)) {
      conditions.push(gte(products.basePrice, minPrice.toString()));
    }

    if (!isNaN(maxPrice)) {
      conditions.push(lte(products.basePrice, maxPrice.toString()));
    }

    if (categoryFilter) {
      conditions.push(eq(products.categoryId, categoryFilter));
    }

    if (searchFilter) {
      conditions.push(
        or(
          ilike(products.name, `%${searchFilter}%`),
          ilike(products.description, `%${searchFilter}%`),
          ilike(products.smallTitle, `%${searchFilter}%`)
        )!
      );
    }

    if (req.query.featured === 'true') {
      conditions.push(eq(products.featured, true));
    }

    if (req.query.popular === 'true') {
      conditions.push(eq(products.popular, true));
    }

    if (req.query.customizable === 'true') {
      conditions.push(eq(products.customizable, true));
    }

    const materialFilter = req.query.material as string;
    if (materialFilter) {
      conditions.push(ilike(sql`array_to_string(${products.materials}, ',')`, `%${materialFilter}%`));
    }

    const whereClause = and(...conditions);

    // Determine sorting order
    let orderByClause = desc(products.createdAt);
    if (sortType === 'price-asc') {
      orderByClause = asc(products.basePrice);
    } else if (sortType === 'price-desc') {
      orderByClause = desc(products.basePrice);
    } else if (sortType === 'popular') {
      // Order popular first, then by creation date
      orderByClause = desc(products.popular);
    }

    // Retrieve products matching filters using Drizzle Relational Queries to avoid N+1
    const productList = await db.query.products.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit: limit,
      offset: offset,
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)]
        },
        sizes: true,
      }
    });

    // Fetch total count for pagination metadata
    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    const totalCount = totalCountResult?.count || 0;

    // Map to expected format
    const formattedProducts = productList.map(prod => ({
      id: prod.id,
      slug: prod.slug,
      name: prod.name || prod.smallTitle,
      smallTitle: prod.smallTitle,
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      category: prod.categoryId,
      basePrice: parseFloat(prod.basePrice),
      customizable: prod.customizable,
      featured: prod.featured,
      popular: prod.popular,
      handmade: prod.handmade,
      frameType: prod.frameType || undefined,
      orientation: prod.orientation || undefined,
      materials: prod.materials || [],
      tags: prod.tags || [],
      images: prod.images.map(img => img.imageUrl),
      sizes: prod.sizes.map(sz => ({
        name: sz.sizeName,
        price: parseFloat(sz.price),
      })),
      seoTitle: prod.seoTitle || undefined,
      seoDescription: prod.seoDescription || undefined,
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slugOrId - Fetch a single product by UUID or slug
app.get('/api/products/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;

    // Check if the query parameter is a valid UUID, otherwise query by slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(slugOrId);

    const productRecord = await db.query.products.findFirst({
      where: and(
        eq(products.status, 'published'),
        isUuid ? eq(products.id, slugOrId) : eq(products.slug, slugOrId)
      ),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)]
        },
        sizes: true,
        category: true,
      }
    });

    if (!productRecord) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const formattedProduct = {
      id: productRecord.id,
      slug: productRecord.slug,
      name: productRecord.name || productRecord.smallTitle,
      smallTitle: productRecord.smallTitle,
      description: productRecord.description || '',
      shortDescription: productRecord.shortDescription || '',
      category: productRecord.categoryId,
      basePrice: parseFloat(productRecord.basePrice as string),
      customizable: productRecord.customizable,
      featured: productRecord.featured,
      popular: productRecord.popular,
      handmade: productRecord.handmade,
      frameType: productRecord.frameType || undefined,
      orientation: productRecord.orientation || undefined,
      materials: productRecord.materials || [],
      tags: productRecord.tags || [],
      images: productRecord.images.map(img => img.imageUrl),
      sizes: productRecord.sizes.map(sz => ({
        name: sz.sizeName,
        price: parseFloat(sz.price),
      })),
      seoTitle: productRecord.seoTitle || undefined,
      seoDescription: productRecord.seoDescription || undefined,
      categoryDetails: productRecord.category ? {
        id: productRecord.category.id,
        name: productRecord.category.name,
        description: productRecord.category.description,
        imageUrl: productRecord.category.imageUrl,
      } : undefined,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
