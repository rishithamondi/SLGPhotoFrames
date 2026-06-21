export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  smallTitle?: string;
  category: string;
  images: string[];
  description: string;
  shortDescription?: string;
  materials: string[];
  sizes: ProductSize[];
  basePrice: number;
  customizable: boolean;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  orientation?: "Portrait" | "Landscape";
  frameType?: string;
  handmade?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  categoryDetails?: Category;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  imageUrl?: string; // from backend
  productCount?: number;
}

export interface Pagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: "latest" | "price-low" | "price-high" | "popular";
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  popular?: boolean;
  customizable?: boolean;
  material?: string;
}
