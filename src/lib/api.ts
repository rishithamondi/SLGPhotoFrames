import { Category, FetchProductsParams, Product, ProductsResponse } from "../types/api";

const BASE_URL = "/api";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("admin_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export async function fetchProducts(params?: FetchProductsParams): Promise<ProductsResponse> {
  const url = new URL(`${window.location.origin}${BASE_URL}/products`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

export async function fetchProduct(slugOrId: string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/${encodeURIComponent(slugOrId)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }
  return response.json();
}

// --- ADMIN API FETCHERS ---

export async function adminLogin(email: string, password: string): Promise<{ token: string; admin: { id: string; email: string } }> {
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Login failed");
  }
  
  return response.json();
}

export async function fetchAdminMe(): Promise<{ admin: { id: string; email: string } }> {
  const response = await fetch(`${BASE_URL}/admin/me`, {
    headers: { ...getAuthHeaders() },
  });
  
  if (!response.ok) {
    throw new Error("Session expired or invalid");
  }
  
  return response.json();
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  categoriesCount: number;
  recentlyAdded: Array<{
    id: string;
    name: string;
    smallTitle: string;
    basePrice: number;
    status: string;
    imageUrl: string;
    createdAt: string;
  }>;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { ...getAuthHeaders() },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }
  
  return response.json();
}

export async function fetchAdminProducts(params?: FetchProductsParams & { status?: string }): Promise<ProductsResponse> {
  const url = new URL(`${window.location.origin}${BASE_URL}/admin/products`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: { ...getAuthHeaders() },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch admin products");
  }
  
  return response.json();
}

export async function createAdminProduct(productData: Partial<Product>): Promise<Product> {
  console.log("[Save Flow] Step 3: Inside createAdminProduct API call, sending fetch request to /api/admin/products");
  
  try {
    const response = await fetch(`${BASE_URL}/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });

    console.log("[Save Flow] Step 3.1: API response status received:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Save Flow] Step 3.2: API response returned error status:", errorData);
      throw new Error(errorData.error || "Failed to create product");
    }

    const data = await response.json();
    console.log("[Save Flow] Step 3.3: API call succeeded, payload data:", JSON.stringify(data));
    return data;
  } catch (apiErr) {
    console.error("[Save Flow] Step 3.4: API fetch call caught exception:", apiErr);
    throw apiErr;
  }
}

export async function updateAdminProduct(id: string, productData: Partial<Product>): Promise<Product> {
  console.log(`[Save Flow] Step 3: Inside updateAdminProduct API call for ID ${id}, sending fetch request`);
  
  try {
    const response = await fetch(`${BASE_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });

    console.log("[Save Flow] Step 3.1: API response status received:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Save Flow] Step 3.2: API response returned error status:", errorData);
      throw new Error(errorData.error || "Failed to update product");
    }

    const data = await response.json();
    console.log("[Save Flow] Step 3.3: API call succeeded, payload data:", JSON.stringify(data));
    return data;
  } catch (apiErr) {
    console.error("[Save Flow] Step 3.4: API fetch call caught exception:", apiErr);
    throw apiErr;
  }
}

export async function deleteAdminProduct(id: string, permanent?: boolean): Promise<{ message: string }> {
  const url = `${BASE_URL}/admin/products/${id}${permanent ? '?permanent=true' : ''}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete product");
  }

  return response.json();
}

export async function uploadAdminImage(file: File): Promise<{ imageUrl: string }> {
  console.log("[Save Flow] Step 2.2.1: Inside uploadAdminImage API call, preparation started for file:", file.name);
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${BASE_URL}/admin/upload`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData,
    });

    console.log("[Save Flow] Step 2.2.2: Upload API response status received:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Save Flow] Step 2.2.3: Upload API error response:", errorData);
      throw new Error(errorData.error || "Failed to upload image");
    }

    const data = await response.json();
    console.log("[Save Flow] Step 2.2.4: Upload API succeeded, URL payload:", JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("[Save Flow] Step 2.2.5: Upload API call encountered exception:", err);
    throw err;
  }
}

export async function generateProductDetailsAI(payload: any): Promise<any> {
  const response = await fetch(`${BASE_URL}/admin/products/generate-details`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({
    success: false,
    error: "Failed to parse API server response"
  }));

  if (!response.ok || !responseData.success) {
    throw new Error(responseData.error || "Failed to generate details");
  }

  return responseData.data;
}

