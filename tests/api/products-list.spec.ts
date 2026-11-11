import { expect, test } from '@playwright/test';
import { ProductsApi, type ProductsPage } from '../../src/api/ProductsApi';

function expectValidProductsPage(
  productsPage: ProductsPage,
  page: number,
): void {
  expect(productsPage.current_page).toBe(page);
  expect(Number.isInteger(productsPage.per_page)).toBe(true);
  expect(productsPage.per_page).toBeGreaterThan(0);
  expect(Number.isInteger(productsPage.total)).toBe(true);
  expect(productsPage.total).toBeGreaterThan(0);
  expect(Number.isInteger(productsPage.last_page)).toBe(true);
  expect(productsPage.last_page).toBe(
    Math.ceil(productsPage.total / productsPage.per_page),
  );
  expect(Array.isArray(productsPage.data)).toBe(true);
  expect(productsPage.data.length).toBeGreaterThan(0);
  expect(productsPage.data.length).toBeLessThanOrEqual(productsPage.per_page);
  expect(productsPage.from).toBe((page - 1) * productsPage.per_page + 1);
  expect(productsPage.to).toBe(
    (page - 1) * productsPage.per_page + productsPage.data.length,
  );

  const ids = new Set<string>();
  for (const product of productsPage.data) {
    expect(product.id).toMatch(/^[0-9A-Z]{26}$/);
    expect(ids.has(product.id)).toBe(false);
    ids.add(product.id);
    expect(typeof product.name).toBe('string');
    expect(product.name.length).toBeGreaterThan(0);
    expect(typeof product.price).toBe('number');
    expect(Number.isFinite(product.price)).toBe(true);
    expect(product.price).toBeGreaterThanOrEqual(0);
    expect(typeof product.in_stock).toBe('boolean');
    expect(typeof product.category.id).toBe('string');
    expect(typeof product.category.name).toBe('string');
    expect(product.category.name.length).toBeGreaterThan(0);
    expect(typeof product.brand.id).toBe('string');
    expect(typeof product.brand.name).toBe('string');
    expect(product.brand.name.length).toBeGreaterThan(0);
  }
}

test('returns distinct paginated product lists @smoke @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  const firstPage =
    await test.step('Browse the first page of products', async () => {
      const response = await productsApi.listProducts(1);
      expect(response.status()).toBe(200);
      const productsPage = (await response.json()) as ProductsPage;
      expectValidProductsPage(productsPage, 1);
      expect(productsPage.total).toBeGreaterThan(productsPage.per_page);
      return productsPage;
    });

  await test.step('Browse the second page of products', async () => {
    const response = await productsApi.listProducts(2);
    expect(response.status()).toBe(200);
    const secondPage = (await response.json()) as ProductsPage;
    expectValidProductsPage(secondPage, 2);
    expect(secondPage.total).toBe(firstPage.total);
    expect(secondPage.per_page).toBe(firstPage.per_page);
    const firstPageIds = new Set(firstPage.data.map(({ id }) => id));
    expect(secondPage.data.some(({ id }) => firstPageIds.has(id))).toBe(false);
  });
});
