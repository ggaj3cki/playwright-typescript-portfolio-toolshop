import type { APIRequestContext, APIResponse } from '@playwright/test';

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
    return this.request.post('/carts');
  }

  async getCart(cartId: string): Promise<APIResponse> {
    return this.request.get(`/carts/${encodeURIComponent(cartId)}`);
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<APIResponse> {
    return this.request.post(`/carts/${encodeURIComponent(cartId)}`, {
      data: { product_id: productId, quantity },
    });
  }

  async updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<APIResponse> {
    return this.request.put(
      `/carts/${encodeURIComponent(cartId)}/product/quantity`,
      {
        data: { product_id: productId, quantity },
      },
    );
  }

  async removeItem(cartId: string, productId: string): Promise<APIResponse> {
    return this.request.delete(
      `/carts/${encodeURIComponent(cartId)}/product/${encodeURIComponent(productId)}`,
    );
  }

  async deleteCart(cartId: string): Promise<APIResponse> {
    return this.request.delete(`/carts/${encodeURIComponent(cartId)}`);
  }
}
