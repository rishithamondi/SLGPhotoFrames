import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { eq, and, or, ilike, sql, desc, asc, not, SQL } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from '../db';
import { admins, products, productImages, productSizes, categories } from '../db/schema';
import { authenticateToken, AdminRequest } from '../middleware/auth';

dotenv.config();

const router = Router();

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/i;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (JPG, JPEG, PNG, and WEBP). SVGs are not allowed.'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// --- HELPER FUNCTIONS ---
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getUniqueSlug(title: string, productId?: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });

    if (!existing || (productId && existing.id === productId)) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}

// --- AUTHENTICATION ROUTES ---

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const lookupEmail = email.toLowerCase().trim();
    const admin = await db.query.admins.findFirst({
      where: eq(admins.email, lookupEmail),
    });

    console.log(`[AI Login Debug] Email: "${lookupEmail}", Admin Found: ${!!admin}`);

    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    console.log(`[AI Login Debug] Email: "${lookupEmail}", Password Match: ${isMatch}`);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/me
router.get('/me', authenticateToken, (req: AdminRequest, res: Response) => {
  res.json({ admin: req.admin });
});

// GET /api/admin/stats (Dashboard overview numbers and recently added)
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const [totalResult] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
    const [activeResult] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.status, 'published'));
    const [categoriesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    const recent = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      limit: 5,
      with: {
        images: true,
      }
    });

    res.json({
      totalProducts: totalResult?.count || 0,
      activeProducts: activeResult?.count || 0,
      categoriesCount: categoriesResult?.count || 0,
      recentlyAdded: recent.map(prod => ({
        id: prod.id,
        name: prod.name || prod.smallTitle,
        smallTitle: prod.smallTitle,
        basePrice: parseFloat(prod.basePrice),
        status: prod.status,
        imageUrl: prod.images[0]?.imageUrl || '/placeholder.svg',
        createdAt: prod.createdAt,
      })),
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// --- FILE UPLOAD ROUTE ---

// POST /api/admin/upload
router.post('/upload', authenticateToken, (req: Request, res: Response) => {
  console.log("[Save Flow] Step 2.2.1.1: Backend received POST /api/admin/upload request");
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('[Save Flow] Step 2.2.1.2: Multer processing error:', err);
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      console.error('[Save Flow] Step 2.2.1.3: No file found in request');
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    console.log('[Save Flow] Step 2.2.1.4: File buffer ready. size:', req.file.buffer.length);

    try {
      console.log('[Save Flow] Step 2.2.1.5: Calling Cloudinary uploadBuffer...');
      const { uploadBuffer } = await import('../config/cloudinary');
      const result = await uploadBuffer(req.file.buffer);
      console.log('[Save Flow] Step 2.2.1.6: Cloudinary upload succeeded, URL:', result.secure_url);
      res.json({ imageUrl: result.secure_url });
    } catch (uploadErr) {
      console.error('[Save Flow] Step 2.2.1.7: Cloudinary upload exception caught:', uploadErr);
      res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }
  });
});

// --- PRODUCT CRUD ROUTES ---

// GET /api/admin/products (List all products with search, pagination, status, category filter)
router.get('/products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    const categoryFilter = req.query.category as string;
    const statusFilter = req.query.status as string; // 'published' | 'draft' | 'archived' | 'inactive'
    const searchFilter = req.query.search as string;

    const conditions: SQL[] = [];

    if (categoryFilter) {
      conditions.push(eq(products.categoryId, categoryFilter));
    }

    if (statusFilter) {
      conditions.push(eq(products.status, statusFilter as "draft" | "published" | "archived" | "inactive"));
    } else {
      // By default, exclude inactive products from the list view or show all?
      // Let's show everything except 'inactive' unless statusFilter is requested, or just show all
      // Better: show draft, published, archived. Only hide inactive if requested, or show everything
      // Let's show all statuses for admin so they can manage everything
    }

    if (searchFilter) {
      conditions.push(
        or(
          ilike(products.name, `%${searchFilter}%`),
          ilike(products.smallTitle, `%${searchFilter}%`),
          ilike(products.description, `%${searchFilter}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const productList = await db.query.products.findMany({
      where: whereClause,
      orderBy: [desc(products.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
        sizes: true,
      },
    });

    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    const totalCount = totalCountResult?.count || 0;

    res.json({
      products: productList.map(prod => ({
        ...prod,
        basePrice: parseFloat(prod.basePrice),
        sizes: prod.sizes.map(sz => ({
          name: sz.sizeName,
          price: parseFloat(sz.price),
        })),
        images: prod.images.map(img => img.imageUrl),
      })),
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/admin/products/:id (Fetch a single product by ID for admin)
router.get('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRecord = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)]
        },
        sizes: true,
      }
    });

    if (!productRecord) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const formattedProduct = {
      id: productRecord.id,
      slug: productRecord.slug,
      name: productRecord.name || productRecord.smallTitle,
      smallTitle: productRecord.smallTitle,
      description: productRecord.description || '',
      shortDescription: productRecord.shortDescription || '',
      category: productRecord.categoryId,
      basePrice: parseFloat(productRecord.basePrice),
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
      status: productRecord.status,
      displayOrder: productRecord.displayOrder,
      seoTitle: productRecord.seoTitle || undefined,
      seoDescription: productRecord.seoDescription || undefined,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching admin product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// POST /api/admin/products (Create a product)
router.post('/products', authenticateToken, async (req: Request, res: Response) => {
  console.log("[Save Flow] Step 3.0.1: Backend received POST /api/admin/products request");
  try {
    const {
      smallTitle,
      name,
      description,
      shortDescription,
      categoryId,
      basePrice,
      customizable,
      featured,
      popular,
      handmade,
      frameType,
      orientation,
      materials,
      tags,
      status,
      displayOrder,
      seoTitle,
      seoDescription,
      sizes,  // Array of { name, price }
      images, // Array of string URLs
    } = req.body;

    console.log("[Save Flow] Step 3.0.2: Extracted body properties, smallTitle:", smallTitle, "basePrice:", basePrice);

    if (!smallTitle || !categoryId || !basePrice) {
      console.error("[Save Flow] Step 3.0.3: Validation failed on backend. smallTitle, categoryId, or basePrice missing");
      res.status(400).json({ error: 'Small title, category, and base price are required' });
      return;
    }

    console.log("[Save Flow] Step 3.0.4: Calling getUniqueSlug for smallTitle:", smallTitle);
    const slug = await getUniqueSlug(smallTitle);
    console.log("[Save Flow] Step 3.0.5: Slug generated:", slug);

    console.log("[Save Flow] Step 3.0.6: Starting database transaction...");
    const newProduct = await db.transaction(async (tx) => {
      console.log("[Save Flow] Step 3.0.7: Inside transaction, inserting product record...");
      const [productRecord] = await tx.insert(products).values({
        slug,
        smallTitle,
        name: name || smallTitle,
        description: description || '',
        shortDescription: shortDescription || '',
        categoryId,
        basePrice: basePrice.toString(),
        customizable: customizable || false,
        featured: featured || false,
        popular: popular || false,
        handmade: handmade || false,
        frameType: frameType || null,
        orientation: orientation || null,
        materials: materials || [],
        tags: tags || [],
        status: status || 'published',
        displayOrder: displayOrder || 0,
        seoTitle: seoTitle || `${smallTitle} | SLG Photo Frames`,
        seoDescription: seoDescription || description?.slice(0, 155) || '',
      }).returning();

      const productId = productRecord.id;
      console.log("[Save Flow] Step 3.0.8: Product inserted with UUID:", productId);

      // 2. Insert sizes
      if (sizes && sizes.length > 0) {
        console.log("[Save Flow] Step 3.0.9: Inserting product sizes...");
        for (const sz of sizes) {
          await tx.insert(productSizes).values({
            productId,
            sizeName: sz.name,
            price: sz.price.toString(),
          });
        }
      }

      // 3. Insert images
      if (images && images.length > 0) {
        console.log("[Save Flow] Step 3.0.10: Inserting product images...");
        for (let i = 0; i < images.length; i++) {
          await tx.insert(productImages).values({
            productId,
            imageUrl: images[i],
            displayOrder: i,
          });
        }
      }

      console.log("[Save Flow] Step 3.0.11: Database insert statements executed successfully");
      return {
        ...productRecord,
        category: productRecord.categoryId,
        basePrice: parseFloat(productRecord.basePrice),
        sizes: sizes || [],
        images: images || [],
      };
    });

    console.log("[Save Flow] Step 3.0.12: Transaction completed, responding to client");
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('[Save Flow] Step 3.0.13: Exception caught in backend /products POST handler:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id (Update a product)
router.put('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      smallTitle,
      name,
      description,
      shortDescription,
      categoryId,
      basePrice,
      customizable,
      featured,
      popular,
      handmade,
      frameType,
      orientation,
      materials,
      tags,
      status,
      displayOrder,
      seoTitle,
      seoDescription,
      sizes,  // Array of { name, price }
      images, // Array of string URLs
    } = req.body;

    // Verify product exists
    const productRecord = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!productRecord) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Slug validation and update
    let slug = productRecord.slug;
    if (smallTitle && smallTitle !== productRecord.smallTitle) {
      slug = await getUniqueSlug(smallTitle, id);
    }

    const updatedProduct = await db.transaction(async (tx) => {
      // 1. Update product base fields
      const [updatedRecord] = await tx.update(products).set({
        slug,
        smallTitle: smallTitle !== undefined ? smallTitle : productRecord.smallTitle,
        name: name !== undefined ? name : productRecord.name,
        description: description !== undefined ? description : productRecord.description,
        shortDescription: shortDescription !== undefined ? shortDescription : productRecord.shortDescription,
        categoryId: categoryId !== undefined ? categoryId : productRecord.categoryId,
        basePrice: basePrice !== undefined ? basePrice.toString() : productRecord.basePrice,
        customizable: customizable !== undefined ? customizable : productRecord.customizable,
        featured: featured !== undefined ? featured : productRecord.featured,
        popular: popular !== undefined ? popular : productRecord.popular,
        handmade: handmade !== undefined ? handmade : productRecord.handmade,
        frameType: frameType !== undefined ? frameType : productRecord.frameType,
        orientation: orientation !== undefined ? orientation : productRecord.orientation,
        materials: materials !== undefined ? materials : productRecord.materials,
        tags: tags !== undefined ? tags : productRecord.tags,
        status: status !== undefined ? status : productRecord.status,
        displayOrder: displayOrder !== undefined ? displayOrder : productRecord.displayOrder,
        seoTitle: seoTitle !== undefined ? seoTitle : productRecord.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : productRecord.seoDescription,
        updatedAt: new Date(),
      }).where(eq(products.id, id)).returning();

      // 2. Replace sizes
      if (sizes !== undefined) {
        await tx.delete(productSizes).where(eq(productSizes.productId, id));
        if (sizes.length > 0) {
          for (const sz of sizes) {
            await tx.insert(productSizes).values({
              productId: id,
              sizeName: sz.name,
              price: sz.price.toString(),
            });
          }
        }
      }

      // 3. Replace images
      if (images !== undefined) {
        await tx.delete(productImages).where(eq(productImages.productId, id));
        if (images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            await tx.insert(productImages).values({
              productId: id,
              imageUrl: images[i],
              displayOrder: i,
            });
          }
        }
      }

      return {
        ...updatedRecord,
        category: updatedRecord.categoryId,
        basePrice: parseFloat(updatedRecord.basePrice),
        sizes: sizes || [],
        images: images || [],
      };
    });

    // Query final product with relations for complete output
    const finalProduct = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)]
        },
        sizes: true,
      }
    });

    if (!finalProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({
      id: finalProduct.id,
      slug: finalProduct.slug,
      name: finalProduct.name || finalProduct.smallTitle,
      smallTitle: finalProduct.smallTitle,
      description: finalProduct.description || '',
      shortDescription: finalProduct.shortDescription || '',
      category: finalProduct.categoryId,
      basePrice: parseFloat(finalProduct.basePrice),
      customizable: finalProduct.customizable,
      featured: finalProduct.featured,
      popular: finalProduct.popular,
      handmade: finalProduct.handmade,
      frameType: finalProduct.frameType || undefined,
      orientation: finalProduct.orientation || undefined,
      materials: finalProduct.materials || [],
      tags: finalProduct.tags || [],
      images: finalProduct.images.map(img => img.imageUrl),
      sizes: finalProduct.sizes.map(sz => ({
        name: sz.sizeName,
        price: parseFloat(sz.price),
      })),
      status: finalProduct.status,
      displayOrder: finalProduct.displayOrder,
      seoTitle: finalProduct.seoTitle || undefined,
      seoDescription: finalProduct.seoDescription || undefined,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id (Soft or Permanent delete)
router.delete('/products/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    const productRecord = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!productRecord) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (permanent) {
      // Query associated images before database deletion
      const imagesToDelete = await db.query.productImages.findMany({
        where: eq(productImages.productId, id),
      });

      // Perform permanent delete in DB
      await db.transaction(async (tx) => {
        await tx.delete(productSizes).where(eq(productSizes.productId, id));
        await tx.delete(productImages).where(eq(productImages.productId, id));
        await tx.delete(products).where(eq(products.id, id));
      });

      // Delete images from Cloudinary
      try {
        const { default: cloudinary } = await import('../config/cloudinary');
        const extractPublicId = (url: string): string | null => {
          const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
          return match ? match[1] : null;
        };

        for (const img of imagesToDelete) {
          const publicId = extractPublicId(img.imageUrl);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(`[Cloudinary] Deleted permanent image: ${publicId}`);
          }
        }
      } catch (cloudinaryErr) {
        console.error('Failed to delete assets from Cloudinary during product deletion:', cloudinaryErr);
      }

      res.json({ message: 'Product permanently deleted successfully' });
    } else {
      // Perform soft delete
      await db.update(products).set({
        status: 'inactive',
        updatedAt: new Date(),
      }).where(eq(products.id, id));

      res.json({ message: 'Product soft deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// AI Details generation (Overhauled: text-only, production-stable)
router.post('/products/generate-details', authenticateToken, async (req: Request, res: Response) => {
  const { smallTitle, category, basePrice, sizes, materials } = req.body;

  console.log("[AI Generate] Request received");

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[AI Generate] Gemini API key is missing");
      res.status(200).json({ success: false, error: 'Invalid Gemini API Key' });
      return;
    }

    const prompt = `You are an expert ecommerce content writer for Sri Lakshmi Ganapathi Photo Frames, a premium devotional photo frame and gifting business established in 1985.

Generate high-quality product details for the following product:
- Product Title: ${smallTitle || 'Unknown'}
- Category: ${category || 'Unknown'}
- Base Price: ${basePrice ? `₹${basePrice}` : 'Not provided'}
- Sizes available: ${JSON.stringify(sizes || [])}
- Selected Materials (Factual context - do not invent others): ${materials || 'None selected'}

Content Strategy Guidelines:
1. Tone: Premium, elegant, traditional, devotional, trustworthy, and gift-focused.
2. Full Name (fullName): Generate a premium catalog title following the formula: [Premium Descriptor] + [Deity/Product] + [Material] + [Product Type] (e.g. "Sacred 999 Silver Ambe Maa Devotional Frame" or "Premium Lord Balaji Gold Foil Temple Frame").
3. Frame Type (frameType): Select the most suitable option from: "Teak Wood Frame", "Premium Wooden Frame", "Gold Foil Frame", "Decorative Frame", "Silver Gift Frame", "MDF Frame", "Temple Decor Frame".
4. Description (description): Write a highly premium storefront description of 120-180 words. Start with an emotional/devotional hook. Naturally mention craftsmanship, pooja room/home decor suitability, gifting occasions, deity significance, and festivals if relevant. Ensure it reads like a premium copy writer wrote it.
   - If any materials are selected, describe them accurately (e.g. mention "premium gold foil detailing" if Gold Foil is selected, "999 silver plated devotional artwork" if 999 Silver Plated is selected, or "illuminated devotional display" if LED Lighting Panel is selected).
5. Short Description (shortDescription): Exactly one premium sentence (maximum 20 words) suitable for catalog listing summaries.
6. SEO Title (seoTitle): Max 60 characters containing primary deity/product name.
7. SEO Description (seoDescription): Max 160 characters encouraging purchase/gifting.
8. Boolean Rules:
   - featured: set to true if the base price is >= ₹1000 (base price provided: ${basePrice || 0}).
   - popular: set to true if the product title contains any of these deities: Balaji, Sai Baba, Jesus, Durga, Ganesh, Krishna, Lakshmi, Venkateswara, Hanuman.
   - handmade: set to true by default.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING, description: "Premium catalog title" },
        frameType: { type: Type.STRING, description: "Suitable option from: 'Teak Wood Frame', 'Premium Wooden Frame', 'Gold Foil Frame', 'Decorative Frame', 'Silver Gift Frame', 'MDF Frame', 'Temple Decor Frame'" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags related to the product" },
        description: { type: Type.STRING, description: "Storefront description of 120-180 words" },
        shortDescription: { type: Type.STRING, description: "Exactly one premium sentence of max 20 words" },
        seoTitle: { type: Type.STRING, description: "Max 60 characters containing deity/product name" },
        seoDescription: { type: Type.STRING, description: "Max 160 characters encouraging purchase/gifting" },
        featured: { type: Type.BOOLEAN, description: "true if base price is >= ₹1000, false otherwise" },
        popular: { type: Type.BOOLEAN, description: "true if title contains popular deities, false otherwise" },
        handmade: { type: Type.BOOLEAN, description: "true by default" }
      },
      required: [
        "fullName", "frameType", "tags", "description", "shortDescription", "seoTitle", "seoDescription", "featured", "popular", "handmade"
      ]
    };

    console.log("[AI Generate] Initializing Gemini AI client...");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Helper function to execute generation with retries on 503/UNAVAILABLE errors
    const generateWithRetry = async (model: string): Promise<any> => {
      const maxAttempts = 3;
      const delays = [0, 2000, 4000];

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`[AI Generate] Model: ${model}`);
        console.log(`[AI Generate] Attempt ${attempt}/${maxAttempts}`);

        if (attempt > 1) {
          console.log(`[AI Generate] Waiting ${delays[attempt - 1] / 1000} seconds before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
        }

        try {
          const res = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: schema
            }
          });
          return res;
        } catch (err: any) {
          const status = err.status || err.statusCode || (err.message && err.message.includes('503') ? 503 : undefined);
          console.log(`[AI Generate] Model: ${model}`);
          console.log(`[AI Generate] Status: ${status || '503 (inferred)'}`);
          console.error(`[AI Generate] Error on attempt ${attempt}:`, err.message || err);

          const is503 = status === 503 || (err.message && (
            err.message.includes('503') || 
            err.message.includes('UNAVAILABLE') || 
            err.message.includes('high demand') ||
            err.message.includes('overloaded')
          ));

          if (is503 && attempt < maxAttempts) {
            continue;
          }
          throw err;
        }
      }
    };

    let response;
    try {
      console.log("[AI Generate] Attempting generation with primary model...");
      response = await generateWithRetry('gemini-2.5-pro');
    } catch (primaryErr: any) {
      const status = primaryErr.status || primaryErr.statusCode || (primaryErr.message && primaryErr.message.includes('503') ? 503 : undefined);
      const is503 = status === 503 || (primaryErr.message && (
        primaryErr.message.includes('503') || 
        primaryErr.message.includes('UNAVAILABLE') || 
        primaryErr.message.includes('high demand') ||
        primaryErr.message.includes('overloaded')
      ));

      if (is503) {
        console.warn(`[AI Generate] Primary model 'gemini-2.5-pro' failed with 503/UNAVAILABLE after 3 attempts. Trying fallback model 'gemini-2.5-flash'...`);
        response = await generateWithRetry('gemini-2.5-flash');
      } else {
        throw primaryErr; // Propagate non-503 errors (e.g. 403 Forbidden)
      }
    }

    console.log("[AI Generate] Gemini response received");

    if (!response || !response.text) {
      console.error('[AI Generate] Gemini invalid empty response');
      res.status(200).json({ success: false, error: 'Empty response from Gemini API' });
      return;
    }

    let content = response.text.trim();
    let result: any = {};
    try {
      result = JSON.parse(content);
      console.log("[AI Generate] Parsed JSON successfully");
    } catch (e) {
      console.error('[AI Generate] JSON Parse Error:', e, 'Content trying to parse:', content);
      res.status(200).json({ success: false, error: 'Failed to parse AI response' });
      return;
    }

    const finalResponse = {
      success: true,
      data: {
        fullName: result.fullName || '',
        frameType: result.frameType || '',
        tags: Array.isArray(result.tags) ? result.tags : [],
        description: result.description || '',
        shortDescription: result.shortDescription || '',
        seoTitle: result.seoTitle || '',
        seoDescription: result.seoDescription || '',
        featured: typeof result.featured === 'boolean' ? result.featured : false,
        popular: typeof result.popular === 'boolean' ? result.popular : false,
        handmade: typeof result.handmade === 'boolean' ? result.handmade : true
      }
    };

    res.json(finalResponse);
  } catch (error) {
    console.error('[AI Generate] Gemini generation catch error:', error);
    
    let errMsg = "Failed to generate details with AI";
    const errorStr = error instanceof Error ? error.message : String(error);
    const status = (error as any).status;

    if (
      status === 400 || 
      status === 403 || 
      errorStr.toLowerCase().includes("api key not valid") || 
      errorStr.toLowerCase().includes("invalid api key") ||
      errorStr.toLowerCase().includes("permission")
    ) {
      errMsg = "Invalid Gemini API Key";
    } else if (
      status === 429 || 
      errorStr.toLowerCase().includes("quota") || 
      errorStr.toLowerCase().includes("exhausted") || 
      errorStr.toLowerCase().includes("limit")
    ) {
      errMsg = "Gemini quota exceeded";
    }

    res.status(200).json({ 
      success: false, 
      error: errMsg
    });
  }
});

export default router;
