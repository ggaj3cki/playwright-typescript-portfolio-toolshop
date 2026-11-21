import { expect, test as base, type APIRequestContext } from '@playwright/test';
import { CartsApi } from '../api/CartsApi';
import { ProductsApi } from '../api/ProductsApi';
import { UsersApi } from '../api/UsersApi';
import { API_BASE_URL } from '../api/apiBaseUrl';

interface ApiFixtures {
  apiContext: APIRequestContext;
  productsApi: ProductsApi;
  cartsApi: CartsApi;
  usersApi: UsersApi;
  cart: { id: string };
  trackCartForCleanup: (cartId: string) => void;
}

export const test = base.extend<ApiFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    try {
      await use(context);
    } finally {
      await context.dispose();
    }
  },
  productsApi: async ({ apiContext }, use) => {
    await use(new ProductsApi(apiContext));
  },
  cartsApi: async ({ apiContext }, use) => {
    await use(new CartsApi(apiContext));
  },
  usersApi: async ({ apiContext }, use) => {
    await use(new UsersApi(apiContext));
  },
  cart: async ({ cartsApi }, use) => {
    const cart = await test.step('Create a guest cart', async () => {
      const response = await cartsApi.createCart();
      expect(response.status()).toBe(201);
      const body = (await response.json()) as { id: unknown };
      expect(typeof body.id === 'string' && body.id.length > 0).toBe(true);
      return { id: body.id as string };
    });
    await use(cart);
    await test.step('Delete the guest cart', async () => {
      const response = await cartsApi.deleteCart(cart.id);
      expect(response.status()).toBe(204);
    });
  },
  trackCartForCleanup: async ({ cartsApi }, use) => {
    const cartIds: string[] = [];
    await use((cartId) => {
      cartIds.push(cartId);
    });
    let firstError: unknown;
    let cleanupFailed = false;
    for (const cartId of cartIds) {
      try {
        await test.step('Delete the guest cart', async () => {
          const response = await cartsApi.deleteCart(cartId);
          expect(response.status()).toBe(204);
        });
      } catch (error) {
        if (!cleanupFailed) firstError = error;
        cleanupFailed = true;
      }
    }
    if (cleanupFailed) throw firstError;
  },
});

export { expect };
