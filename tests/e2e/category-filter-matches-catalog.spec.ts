import { expect, test } from '@playwright/test';
import {
  ProductsApi,
  type Product,
  type ProductsPage,
} from '../../src/api/ProductsApi';
import { categoryFilterData } from '../../src/data/categoryFilterData';
import { HomePage } from '../../src/pages/HomePage';

const MAX_CATALOG_PAGES = 10;

test('shows the catalog products from the selected category @regression @e2e', async ({
  page,
  request,
}) => {
  const homePage = new HomePage(page);
  const { categoryName } = categoryFilterData;

  const { expectedIds, perPage } =
    await test.step('Identify the category products in the unfiltered catalog', async () => {
      const productsApi = new ProductsApi(request);
      const firstResponse = await productsApi.listProducts(1);
      expect(firstResponse.status()).toBe(200);
      const firstPage = (await firstResponse.json()) as ProductsPage;
      expect(firstPage.current_page).toBe(1);
      expect(Number.isInteger(firstPage.last_page)).toBe(true);
      expect(firstPage.last_page).toBeGreaterThan(0);
      expect(
        firstPage.last_page,
        'Catalog exceeds the 10-page read limit',
      ).toBeLessThanOrEqual(MAX_CATALOG_PAGES);
      expect(Number.isInteger(firstPage.per_page)).toBe(true);
      expect(firstPage.per_page).toBeGreaterThan(0);

      const products: Product[] = [...firstPage.data];
      for (
        let pageNumber = 2;
        pageNumber <= firstPage.last_page;
        pageNumber++
      ) {
        const response = await productsApi.listProducts(pageNumber);
        expect(response.status()).toBe(200);
        const catalogPage = (await response.json()) as ProductsPage;
        expect(catalogPage.current_page).toBe(pageNumber);
        expect(catalogPage.per_page).toBe(firstPage.per_page);
        expect(catalogPage.total).toBe(firstPage.total);
        products.push(...catalogPage.data);
      }
      expect(products).toHaveLength(firstPage.total);

      const matchingProducts = products.filter(
        ({ category }) => category.name === categoryName,
      );
      const categoryIds = new Set(
        matchingProducts.map(({ category }) => category.id),
      );
      expect(
        categoryIds.size,
        `Category "${categoryName}" must have exactly one id`,
      ).toBe(1);
      const expectedIds = new Set(matchingProducts.map(({ id }) => id));
      expect(
        expectedIds.size,
        `Category "${categoryName}" has no products`,
      ).toBeGreaterThan(0);
      expect(expectedIds.size).toBe(matchingProducts.length);
      return { expectedIds, perPage: firstPage.per_page };
    });

  await test.step('Filter the catalog by category', async () => {
    await homePage.goto();
    await homePage.filterByCategory(categoryName);
    await expect(homePage.categoryCheckbox(categoryName)).toBeChecked();
  });

  await test.step('Compare the displayed products with the catalog category', async () => {
    const displayedIds = await homePage.displayedProductIds();
    expect(displayedIds.length).toBeGreaterThan(0);
    expect(new Set(displayedIds).size).toBe(displayedIds.length);
    const unexpectedIds = displayedIds.filter((id) => !expectedIds.has(id));
    expect(unexpectedIds).toEqual([]);

    if (expectedIds.size <= perPage) {
      expect(new Set(displayedIds)).toEqual(expectedIds);
    } else {
      // Only first-page precision is verified when the filtered set spans pages.
      expect(displayedIds).toHaveLength(perPage);
    }
  });
});
