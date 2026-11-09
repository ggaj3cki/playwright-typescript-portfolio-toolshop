import { expect, test } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage';

test('searches products by keyword @regression', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('Find a product in the catalog', async () => {
    await homePage.goto();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  const productName = await homePage.firstProductName();

  await test.step('Search for the product name', async () => {
    await homePage.search(productName);
  });

  await test.step('See the matching product', async () => {
    await expect(homePage.searchCaption).toHaveText(
      `Searched for: ${productName}`,
    );
    await expect(homePage.productNames).toHaveText([productName]);
  });
});
