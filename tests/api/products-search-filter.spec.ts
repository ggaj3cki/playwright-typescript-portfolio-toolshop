import { expect, test, type APIResponse } from '@playwright/test';
import {
  ProductsApi,
  type Product,
  type ProductsPage,
} from '../../src/api/ProductsApi';
import { productSearchData } from '../../src/data/productSearchData';

async function readFirstPage(response: APIResponse): Promise<ProductsPage> {
  expect(response.status()).toBe(200);
  const page = (await response.json()) as ProductsPage;
  expect(page.current_page).toBe(1);
  expect(Array.isArray(page.data)).toBe(true);
  expect(Number.isInteger(page.total)).toBe(true);
  expect(page.total).toBeGreaterThanOrEqual(0);
  expect(page.per_page).toBeGreaterThan(0);
  expect(page.data.length).toBeLessThanOrEqual(page.per_page);
  return page;
}

async function sourceProduct(productsApi: ProductsApi): Promise<Product> {
  const page = await readFirstPage(await productsApi.listProducts(1));
  expect(page.data.length).toBeGreaterThan(0);
  return page.data[0];
}

test('finds products by name on the first page @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  await test.step('Search for products by keyword', async () => {
    const page = await readFirstPage(
      await productsApi.searchProducts(productSearchData.keyword),
    );
    expect(page.data.length).toBeGreaterThan(0);
    const unrelated = page.data
      .map(({ name }) => name)
      .filter(
        (name) =>
          !name.toLowerCase().includes(productSearchData.keyword.toLowerCase()),
      );
    expect(unrelated).toEqual([]);
  });
});

test('returns an empty first page for an unmatched name @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  await test.step('Search for a non-existent product', async () => {
    const page = await readFirstPage(
      await productsApi.searchProducts(productSearchData.noResultsQuery),
    );
    expect(page.data).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.last_page).toBe(1);
    expect(page.from).toBeNull();
    expect(page.to).toBeNull();
  });
});

test('filters the first page by a product category @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  const source = await test.step('Choose a catalog product', () =>
    sourceProduct(productsApi));

  await test.step('Find products in its category', async () => {
    const page = await readFirstPage(
      await productsApi.listProducts(1, { by_category: source.category.id }),
    );
    expect(page.data.length).toBeGreaterThan(0);
    expect(
      page.data
        .filter(({ category }) => category.id !== source.category.id)
        .map(({ category }) => category.id),
    ).toEqual([]);
    if (page.total <= page.per_page) {
      expect(page.data.map(({ id }) => id)).toContain(source.id);
    }
  });
});

test('filters the first page by a product brand @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  const source = await test.step('Choose a catalog product', () =>
    sourceProduct(productsApi));

  await test.step('Find products from its brand', async () => {
    const page = await readFirstPage(
      await productsApi.listProducts(1, { by_brand: source.brand.id }),
    );
    expect(page.data.length).toBeGreaterThan(0);
    expect(
      page.data
        .filter(({ brand }) => brand.id !== source.brand.id)
        .map(({ brand }) => brand.id),
    ).toEqual([]);
    if (page.total <= page.per_page) {
      expect(page.data.map(({ id }) => id)).toContain(source.id);
    }
  });
});

test('sorts the first page by price in both directions @regression @api', async ({
  request,
}) => {
  const productsApi = new ProductsApi(request);

  await test.step('See prices from lowest to highest', async () => {
    const page = await readFirstPage(
      await productsApi.listProducts(1, { sort: 'price,asc' }),
    );
    const prices = page.data.map(({ price }) => price);
    expect(new Set(prices).size).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  await test.step('See prices from highest to lowest', async () => {
    const page = await readFirstPage(
      await productsApi.listProducts(1, { sort: 'price,desc' }),
    );
    const prices = page.data.map(({ price }) => price);
    expect(new Set(prices).size).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
