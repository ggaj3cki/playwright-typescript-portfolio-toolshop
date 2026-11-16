import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API_BASE_URL } from './apiBaseUrl';

const JSON_ACCEPT_HEADER = { Accept: 'application/json' } as const;

export interface CartItem {
  product_id: string;
  quantity: number;
  product: { id: string; price: number };
}

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

export class CartsApi {
  constructor(private readonly request: APIRequestContext) {}

  async createCart(): Promise<APIResponse> {
    return this.request.post(new URL('/carts', API_BASE_URL).toString());
  }

  async getCart(cartId: string): Promise<APIResponse> {
    return this.request.get(
      new URL(`/carts/${encodeURIComponent(cartId)}`, API_BASE_URL).toString(),
    );
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<APIResponse> {
    return this.request.post(
      new URL(`/carts/${encodeURIComponent(cartId)}`, API_BASE_URL).toString(),
      {
        data: { product_id: productId, quantity },
        headers: JSON_ACCEPT_HEADER,
      },
    );
  }

  async updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<APIResponse> {
    return this.request.put(
      new URL(
        `/carts/${encodeURIComponent(cartId)}/product/quantity`,
        API_BASE_URL,
      ).toString(),
      {
        data: { product_id: productId, quantity },
        headers: JSON_ACCEPT_HEADER,
      },
    );
  }

  async removeItem(cartId: string, productId: string): Promise<APIResponse> {
    return this.request.delete(
      new URL(
        `/carts/${encodeURIComponent(cartId)}/product/${encodeURIComponent(productId)}`,
        API_BASE_URL,
      ).toString(),
      { headers: JSON_ACCEPT_HEADER },
    );
  }

  async deleteCart(cartId: string): Promise<APIResponse> {
    return this.request.delete(
      new URL(`/carts/${encodeURIComponent(cartId)}`, API_BASE_URL).toString(),
    );
  }
}
