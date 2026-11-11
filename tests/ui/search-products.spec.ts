import { expect, test } from '@playwright/test';
import { productSearchData } from '../../src/data/productSearchData';
import { HomePage } from '../../src/pages/HomePage';

test('finds a product by its full name on the first page @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  const productName = await homePage.firstProductName();

  await test.step('Search for a catalog product by full name', async () => {
    await homePage.search(productName);
  });

  await test.step('Find the selected product among the results', async () => {
    await expect(homePage.searchCaption).toHaveText(
      `Searched for: ${productName}`,
    );
    await expect
      .poll(async () =>
        (await homePage.productNames.allTextContents()).map((name) =>
          name.trim(),
        ),
      )
      .toContain(productName);
    await expect
      .poll(async () =>
        (await homePage.productNames.allTextContents()).every((name) =>
          name.toLowerCase().includes(productName.toLowerCase()),
        ),
      )
      .toBe(true);
  });
});

test('finds products by a general keyword on the first page @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await test.step('Search for products by keyword', async () => {
    await homePage.search(productSearchData.keyword);
  });

  await test.step('See search state and results', async () => {
    await expect(homePage.searchCaption).toHaveText(
      `Searched for: ${productSearchData.keyword}`,
    );
    await expect(homePage.productNames.first()).toBeVisible();
    await expect
      .poll(async () =>
        (await homePage.productNames.allTextContents()).every((name) =>
          name.toLowerCase().includes(productSearchData.keyword.toLowerCase()),
        ),
      )
      .toBe(true);
  });
});

test('shows an empty state for an unmatched search @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await test.step('Search for an unmatched product', async () => {
    await homePage.search(productSearchData.noResultsQuery);
  });

  await test.step('See the no-results state', async () => {
    await expect(homePage.searchCaption).toHaveText(
      `Searched for: ${productSearchData.noResultsQuery}`,
    );
    await expect(homePage.searchResultCount).toContainText('0 products found');
    await expect(homePage.noResults).toHaveText('There are no products found.');
    await expect(homePage.productNames).toHaveCount(0);
  });
});
