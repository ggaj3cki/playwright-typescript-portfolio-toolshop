import type { APIResponse } from '@playwright/test';
import type { Cart } from '../../src/api/CartsApi';
import {
  type ProductsApi,
  type Product,
  type ProductsPage,
} from '../../src/api/ProductsApi';
import { cartData } from '../../src/data/cartData';
import { expect, test } from '../../src/fixtures/apiFixtures';

test('creates an empty cart @regression @api', async ({ cartsApi, cart }) => {
  const cartId = cart.id;
  await test.step('Read the empty cart', async () => {
    const response = await cartsApi.getCart(cartId);
    expect(response.status()).toBe(200);
    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(cartId);
    expect(cart.cart_items).toEqual([]);
  });
});

async function findInStockProducts(
  productsApi: ProductsApi,
  count: number,
): Promise<Product[]> {
  return test.step('Find in-stock products in the catalog', async () => {
    const response = await productsApi.listProducts(1);
    expect(response.status()).toBe(200);
    const page = (await response.json()) as ProductsPage;
    expect(Array.isArray(page.data)).toBe(true);
    const products = [
      ...new Map(
        page.data
          .filter(({ in_stock }) => in_stock)
          .map((product) => [product.id, product]),
      ).values(),
    ];
    expect(
      products.length,
      `Need ${count} distinct in-stock products on the first catalog page`,
    ).toBeGreaterThanOrEqual(count);
    return products.slice(0, count);
  });
}

async function findInStockProduct(productsApi: ProductsApi): Promise<Product> {
  const [product] = await findInStockProducts(productsApi, 1);
  return product;
}

async function expectQuantityValidationError(
  response: APIResponse,
): Promise<void> {
  expect(response.status()).toBe(422);
  const body = (await response.json()) as {
    message: unknown;
    errors: Record<string, unknown>;
  };
  expect(typeof body.message).toBe('string');
  expect(
    typeof body.errors === 'object' &&
      body.errors !== null &&
      !Array.isArray(body.errors),
  ).toBe(true);
  expect(Object.keys(body.errors)).toEqual(['quantity']);
  const quantityErrors = body.errors.quantity;
  expect(Array.isArray(quantityErrors)).toBe(true);
  expect((quantityErrors as unknown[]).length).toBeGreaterThan(0);
  expect(
    (quantityErrors as unknown[]).every(
      (error) => typeof error === 'string' && error.length > 0,
    ),
  ).toBe(true);
}

test('adds an in-stock product to a cart @regression @api', async ({
  cartsApi,
  productsApi,
  cart,
}) => {
  const sourceProduct = await findInStockProduct(productsApi);
  const cartId = cart.id;

  await test.step('Add one in-stock product', async () => {
    const response = await cartsApi.addItem(cartId, sourceProduct.id, 1);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { result: unknown };
    expect(typeof body.result === 'string' && body.result.length > 0).toBe(
      true,
    );
  });

  await test.step('Read the cart with its product', async () => {
    const response = await cartsApi.getCart(cartId);
    expect(response.status()).toBe(200);
    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(cartId);
    expect(cart.cart_items).toHaveLength(1);
    const [item] = cart.cart_items;
    expect(item.product_id).toBe(sourceProduct.id);
    expect(item.quantity).toBe(1);
    expect(item.product.id).toBe(sourceProduct.id);
    expect(item.product.price).toBe(sourceProduct.price);
  });
});

for (const quantity of cartData.invalidQuantities) {
  test(`rejects quantity ${quantity} and leaves the cart empty @regression @api`, async ({
    cartsApi,
    productsApi,
    cart,
  }) => {
    const sourceProduct = await findInStockProduct(productsApi);
    const cartId = cart.id;

    await test.step('Try to add a product with an invalid quantity', async () => {
      const response = await cartsApi.addItem(
        cartId,
        sourceProduct.id,
        quantity,
      );
      await expectQuantityValidationError(response);
    });

    await test.step('Confirm the cart remains empty', async () => {
      const response = await cartsApi.getCart(cartId);
      expect(response.status()).toBe(200);
      const cart = (await response.json()) as Cart;
      expect(cart.id).toBe(cartId);
      expect(cart.cart_items).toEqual([]);
    });
  });
}

test('updates the quantity of a cart item @regression @api', async ({
  cartsApi,
  productsApi,
  cart,
}) => {
  const sourceProduct = await findInStockProduct(productsApi);
  const cartId = cart.id;

  await test.step('Add one product to the cart', async () => {
    const response = await cartsApi.addItem(cartId, sourceProduct.id, 1);
    expect(response.status()).toBe(200);
  });

  await test.step('Set the product quantity', async () => {
    const response = await cartsApi.updateItemQuantity(
      cartId,
      sourceProduct.id,
      cartData.updatedQuantity,
    );
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { result: unknown };
    expect(typeof body.result === 'string' && body.result.length > 0).toBe(
      true,
    );
  });

  await test.step('Read the updated cart item', async () => {
    const response = await cartsApi.getCart(cartId);
    expect(response.status()).toBe(200);
    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(cartId);
    expect(cart.cart_items).toHaveLength(1);
    const [item] = cart.cart_items;
    expect(item.product_id).toBe(sourceProduct.id);
    expect(item.quantity).toBe(cartData.updatedQuantity);
    expect(item.product.price).toBe(sourceProduct.price);
  });
});

for (const quantity of cartData.invalidQuantities) {
  test(`rejects quantity ${quantity} on update and keeps the previous quantity @regression @api`, async ({
    cartsApi,
    productsApi,
    cart,
  }) => {
    const sourceProduct = await findInStockProduct(productsApi);
    const cartId = cart.id;

    await test.step('Add one product to the cart', async () => {
      const response = await cartsApi.addItem(cartId, sourceProduct.id, 1);
      expect(response.status()).toBe(200);
    });

    await test.step('Reject an invalid quantity change', async () => {
      const response = await cartsApi.updateItemQuantity(
        cartId,
        sourceProduct.id,
        quantity,
      );
      await expectQuantityValidationError(response);
    });

    await test.step('Read the unchanged cart item', async () => {
      const response = await cartsApi.getCart(cartId);
      expect(response.status()).toBe(200);
      const cart = (await response.json()) as Cart;
      expect(cart.id).toBe(cartId);
      expect(cart.cart_items).toHaveLength(1);
      const [item] = cart.cart_items;
      expect(item.product_id).toBe(sourceProduct.id);
      expect(item.quantity).toBe(1);
    });
  });
}

test('removes only the selected product from a cart @regression @api', async ({
  cartsApi,
  productsApi,
  cart,
}) => {
  const [removedProduct, retainedProduct] = await findInStockProducts(
    productsApi,
    2,
  );
  const cartId = cart.id;

  await test.step('Add two different products to the cart', async () => {
    const firstResponse = await cartsApi.addItem(cartId, removedProduct.id, 1);
    expect(firstResponse.status()).toBe(200);
    const secondResponse = await cartsApi.addItem(
      cartId,
      retainedProduct.id,
      2,
    );
    expect(secondResponse.status()).toBe(200);
  });

  await test.step('Remove the selected product', async () => {
    const response = await cartsApi.removeItem(cartId, removedProduct.id);
    expect(response.status()).toBe(204);
    expect((await response.body()).length).toBe(0);
  });

  await test.step('Read the remaining product in the cart', async () => {
    const response = await cartsApi.getCart(cartId);
    expect(response.status()).toBe(200);
    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(cartId);
    expect(cart.cart_items).toHaveLength(1);
    expect(
      cart.cart_items.some(
        ({ product_id }) => product_id === removedProduct.id,
      ),
    ).toBe(false);
    const [item] = cart.cart_items;
    expect(item.product_id).toBe(retainedProduct.id);
    expect(item.quantity).toBe(2);
    expect(item.product.price).toBe(retainedProduct.price);
  });
});
