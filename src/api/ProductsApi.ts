import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface Product {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
  category: { id: string; name: string };
  brand: { id: string; name: string };
}

export interface ProductsPage {
  current_page: number;
  data: Product[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ProductDetails extends Product {
  description: string;
  specs: unknown[];
}

export interface ProductListOptions {
  by_category?: string;
  by_brand?: string;
  sort?: 'price,asc' | 'price,desc';
}

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  async listProducts(
    page: number,
    options: ProductListOptions = {},
  ): Promise<APIResponse> {
    const params: Record<string, string | number> = { page };
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) params[key] = value;
    }
    return this.request.get('/products', { params });
  }

  async getProduct(id: string): Promise<APIResponse> {
    return this.request.get(`/products/${encodeURIComponent(id)}`);
  }

  async searchProducts(query: string): Promise<APIResponse> {
    return this.request.get('/products/search', { params: { q: query } });
  }
}
