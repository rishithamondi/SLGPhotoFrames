/**
 * ASSETS FOLDER STRUCTURE:
 * =======================
 * src/assets/
 * ├── brand/           - Logo and branding images
 * │   └── logo.jpeg
 * ├── home/            - Home page specific images
 * │   ├── hero-banner.jpg
 * │   └── vinayakabro.png (hero section shop photo)
 * ├── about/           - About page images
 * │   └── AmmaNanna.jpeg (artisan portrait)
 * ├── categories/      - Category cover images
 * │   ├── category-frames.jpg
 * │   ├── category-lighting.jpg
 * │   ├── category-silver.jpg
 * │   ├── category-glass.jpg
 * │   └── category-custom.jpg
 * └── products/        - Product photos (to be added)
 *     ├── product-1.jpg
 *     ├── product-2.jpg
 *     └── ...
 *
 * NOTE: When adding product images, place them in src/assets/products/
 * and update the images array below with the path: "/products/product-{id}.jpg"
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  images: string[];  // Paths should be: "/products/product-{id}.jpg" or "/products/product-{id}-1.jpg", etc.
  description: string;
  materials: string[];
  sizes: { name: string; price: number }[];
  basePrice: number;
  customizable: boolean;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: "photo-frames",
    name: "Photo Frames",
    description: "Beautiful handcrafted frames for your precious memories",
    image: "/placeholder.svg",
    productCount: 24,
  },
  {
    id: "lighting-photos",
    name: "Lighting Photos",
    description: "Illuminated photo displays with LED backlighting",
    image: "/placeholder.svg",
    productCount: 12,
  },
  {
    id: "silver-gifts",
    name: "Silver Gift Articles",
    description: "Elegant silver-plated gift items for special occasions",
    image: "/placeholder.svg",
    productCount: 18,
  },
  {
    id: "glass-boxes",
    name: "Glass Boxes",
    description: "Premium glass display boxes and keepsake containers",
    image: "/categories/category-glass.jpg",
    productCount: 8,
  },
  {
    id: "custom-orders",
    name: "Custom Orders",
    description: "Personalized frames made to your specifications",
    image: "/placeholder.svg",
    productCount: 0,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Wooden Frame",
    category: "photo-frames",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    description: "A timeless wooden photo frame crafted from premium teak wood. Perfect for displaying your cherished family photographs. Each frame is hand-finished with natural wood stain to bring out the beautiful grain patterns.",
    materials: ["Teak Wood", "Glass"],
    sizes: [
      { name: "4x6 inches", price: 450 },
      { name: "5x7 inches", price: 550 },
      { name: "8x10 inches", price: 750 },
      { name: "11x14 inches", price: 950 },
    ],
    basePrice: 450,
    customizable: true,
    tags: ["Handmade", "Wood", "Classic"],
    featured: true,
    popular: true,
  },
  {
    id: "2",
    name: "Vintage Gold Frame",
    category: "photo-frames",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "An elegant vintage-style frame with intricate gold detailing. The ornate border design adds a touch of luxury to any photograph. Perfect for wedding photos or formal portraits.",
    materials: ["Resin", "Gold Leaf", "Glass"],
    sizes: [
      { name: "5x7 inches", price: 850 },
      { name: "8x10 inches", price: 1100 },
      { name: "11x14 inches", price: 1450 },
    ],
    basePrice: 850,
    customizable: true,
    tags: ["Handmade", "Vintage", "Premium"],
    featured: true,
  },
  {
    id: "3",
    name: "LED Backlit Photo",
    category: "lighting-photos",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "Modern LED-backlit photo display that illuminates your memories beautifully. Features adjustable brightness and warm white LEDs for the perfect ambiance. Energy-efficient and long-lasting.",
    materials: ["Acrylic", "LED Lights", "Wood Base"],
    sizes: [
      { name: "6x8 inches", price: 1200 },
      { name: "8x12 inches", price: 1600 },
      { name: "12x16 inches", price: 2200 },
    ],
    basePrice: 1200,
    customizable: true,
    tags: ["Modern", "LED", "Gift"],
    featured: true,
    popular: true,
  },
  {
    id: "4",
    name: "Silver Photo Frame",
    category: "silver-gifts",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "Luxurious silver-plated photo frame, perfect as a premium gift for weddings, anniversaries, or special occasions. Comes in an elegant gift box.",
    materials: ["Silver Plated Metal", "Glass", "Velvet Back"],
    sizes: [
      { name: "4x6 inches", price: 1500 },
      { name: "5x7 inches", price: 1900 },
      { name: "8x10 inches", price: 2500 },
    ],
    basePrice: 1500,
    customizable: false,
    tags: ["Premium", "Gift", "Silver"],
    featured: true,
  },
  {
    id: "5",
    name: "Crystal Glass Box",
    category: "glass-boxes",
    images: ["/products/product-glass-boxes/glass-box-1.jpg", "/products/product-glass-boxes/glass-box-2.jpg", "/products/product-glass-boxes/glass-box-3.jpg", "/products/product-glass-boxes/glass-box-4.jpg", "/products/product-glass-boxes/glass-box-5.jpg", "/products/product-glass-boxes/glass-box-6.jpg"],
    description: "Exquisite crystal glass display box for jewelry, keepsakes, or small treasures. Hand-polished edges with brass hinges. A beautiful addition to any dresser or display shelf.",
    materials: ["Crystal Glass", "Brass Hinges"],
    sizes: [
      { name: "Small (4x3x2 in)", price: 800 },
      { name: "Medium (6x4x3 in)", price: 1100 },
      { name: "Large (8x6x4 in)", price: 1500 },
    ],
    basePrice: 800,
    customizable: false,
    tags: ["Premium", "Crystal", "Storage"],
    popular: true,
  },
  {
    id: "6",
    name: "Rustic Barn Wood Frame",
    category: "photo-frames",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "Charming rustic frame made from reclaimed barn wood. Each frame has unique weathering and character. Perfect for farmhouse or country-style decor.",
    materials: ["Reclaimed Wood", "Glass"],
    sizes: [
      { name: "5x7 inches", price: 650 },
      { name: "8x10 inches", price: 850 },
      { name: "11x14 inches", price: 1100 },
    ],
    basePrice: 650,
    customizable: true,
    tags: ["Handmade", "Rustic", "Eco-friendly"],
    featured: true,
  },
  {
    id: "7",
    name: "Multi-Photo Collage Frame",
    category: "photo-frames",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "Display multiple memories in one beautiful collage frame. Features 6 openings of various sizes arranged in an artistic layout. Great for telling a story through photos.",
    materials: ["MDF", "Glass", "Paper Matte"],
    sizes: [
      { name: "16x20 inches (6 photos)", price: 1800 },
      { name: "20x24 inches (9 photos)", price: 2400 },
    ],
    basePrice: 1800,
    customizable: true,
    tags: ["Collage", "Family", "Wall Decor"],
    popular: true,
  },
  {
    id: "8",
    name: "Heart LED Light Frame",
    category: "lighting-photos",
    images: ["/placeholder.svg", "/placeholder.svg"],
    description: "Romantic heart-shaped LED light frame, perfect for couples. Features warm white fairy lights around the heart-shaped border. Ideal gift for Valentine's Day or anniversaries.",
    materials: ["Acrylic", "LED Fairy Lights", "USB Power"],
    sizes: [
      { name: "6x6 inches", price: 900 },
      { name: "8x8 inches", price: 1200 },
    ],
    basePrice: 900,
    customizable: true,
    tags: ["Romantic", "LED", "Gift"],
    featured: true,
  },
  {
    id: "9",
    name: "Silver Trophy Cup",
    category: "silver-gifts",
    images: ["/placeholder.svg"],
    description: "Elegant silver-plated trophy cup suitable for awards and recognition. Can be engraved with custom text. Perfect for corporate gifts or sports achievements.",
    materials: ["Silver Plated Metal", "Wood Base"],
    sizes: [
      { name: "Small (6 inches)", price: 1200 },
      { name: "Medium (8 inches)", price: 1600 },
      { name: "Large (10 inches)", price: 2200 },
    ],
    basePrice: 1200,
    customizable: true,
    tags: ["Award", "Corporate", "Engraving"],
  },
  {
    id: "10",
    name: "Floating Glass Frame",
    category: "glass-boxes",
    images: ["/products/product-glass-boxes/glass-box-1.png", "/products/product-glass-boxes/glass-box-2.png", "/products/product-glass-boxes/glass-box-3.png"],
    description: "Modern floating glass frame that creates the illusion of your photo suspended in mid-air. Double-sided glass allows display from any angle.",
    materials: ["Tempered Glass", "Metal Stand"],
    sizes: [
      { name: "4x6 inches", price: 700 },
      { name: "5x7 inches", price: 900 },
      { name: "8x10 inches", price: 1200 },
    ],
    basePrice: 700,
    customizable: false,
    tags: ["Modern", "Minimalist", "Glass"],
  },
  {
    id: "11",
    name: "Carved Rosewood Frame",
    category: "photo-frames",
    images: ["/placeholder.svg"],
    description: "Exquisite hand-carved rosewood frame featuring traditional Indian motifs. Each piece is a work of art created by skilled craftsmen. Perfect for displaying traditional or wedding photographs.",
    materials: ["Rosewood", "Hand Carving", "Glass"],
    sizes: [
      { name: "5x7 inches", price: 1800 },
      { name: "8x10 inches", price: 2500 },
      { name: "11x14 inches", price: 3500 },
    ],
    basePrice: 1800,
    customizable: true,
    tags: ["Handmade", "Premium", "Traditional"],
    popular: true,
  },
  {
    id: "12",
    name: "Silver God Idol Frame",
    category: "silver-gifts",
    images: ["/placeholder.svg"],
    description: "Beautiful silver-plated frame with embossed religious deity design. Perfect for home temples or as religious gifts. Available in various deity designs.",
    materials: ["Silver Plated Metal", "Velvet Back"],
    sizes: [
      { name: "4x6 inches", price: 2000 },
      { name: "6x8 inches", price: 2800 },
    ],
    basePrice: 2000,
    customizable: false,
    tags: ["Religious", "Silver", "Gift"],
  },
];

export const testimonials = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The quality of the wooden frame I received exceeded my expectations. You can really feel the craftsmanship in every detail. Will definitely order again!",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    location: "Delhi",
    rating: 5,
    text: "Ordered a custom frame for my parents' anniversary. The attention to detail was amazing. They loved it! Thank you for making our gift so special.",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Anita Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "Beautiful LED photo frame for our wedding photo. The lighting is perfect and adds such a lovely ambiance to our bedroom. Highly recommended!",
    image: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Vikram Singh",
    location: "Jaipur",
    rating: 5,
    text: "Got silver frames as corporate gifts. Quick delivery and excellent packaging. All recipients were impressed with the quality.",
    image: "/placeholder.svg",
  },
];
