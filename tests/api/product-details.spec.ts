import { expect, test } from '@playwright/test';
import { productApiData } from '../../src/data/productApiData';
import {
  ProductsApi,
  type ProductDetails,
  type ProductsPage,
} from '../../src/api/ProductsApi';

test('returns details consistent with the catalog @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  const source = await test.step('Find a product in the catalog', async () => {
    const response = await productsApi.listProducts(1);
    expect(response.status()).toBe(200);
    const page = (await response.json()) as ProductsPage;
    expect(page.data.length).toBeGreaterThan(0);
    return page.data[0];
  });

  await test.step('Read the selected product details', async () => {
    const response = await productsApi.getProduct(source.id);
    expect(response.status()).toBe(200);
    const detail = (await response.json()) as ProductDetails;
    expect(detail.id).toBe(source.id);
    expect(detail.name).toBe(source.name);
    expect(detail.price).toBe(source.price);
    expect(detail.in_stock).toBe(source.in_stock);
    expect(detail.category.id).toBe(source.category.id);
    expect(detail.brand.id).toBe(source.brand.id);
    expect(typeof detail.description).toBe('string');
    expect(detail.description.length).toBeGreaterThan(0);
    expect(Array.isArray(detail.specs)).toBe(true);
  });
});

test('reports a missing product @regression @api', async ({ request }) => {
  const productsApi = new ProductsApi(request);

  await test.step('Request a non-existent product', async () => {
    const response = await productsApi.getProduct(
      productApiData.missingProductId,
    );
    expect(response.status()).toBe(404);
    const body = (await response.json()) as { message: unknown };
    expect(body).toEqual({ message: expect.any(String) });
    expect((body.message as string).length).toBeGreaterThan(0);
  });
});
