import { expect, test } from '@playwright/test';
import { categoryFilterData } from '../../src/data/categoryFilterData';
import { HomePage } from '../../src/pages/HomePage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';

test('filters products by category @regression', async ({ page }) => {
  const homePage = new HomePage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const { categoryName } = categoryFilterData;

  await homePage.goto();
  await expect(homePage.productNames.first()).toBeVisible();
  const initialProductNames = (
    await homePage.productNames.allTextContents()
  ).map((name) => name.trim());

  await test.step('Filter products by category', async () => {
    await homePage.filterByCategory(categoryName);
  });

  await test.step('See a product from the selected category', async () => {
    await expect(homePage.categoryCheckbox(categoryName)).toBeChecked();
    await expect(homePage.productNames).not.toHaveText(initialProductNames);
    await homePage.openFirstProduct();
    await expect(productDetailsPage.categoryBadge).toHaveText(categoryName);
  });
});
