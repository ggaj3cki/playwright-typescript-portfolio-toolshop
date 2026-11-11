import { expect, test } from '@playwright/test';
import { categoryFilterData } from '../../src/data/categoryFilterData';
import { HomePage } from '../../src/pages/HomePage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';

test('opens a product from the selected category @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const { categoryName } = categoryFilterData;
  await homePage.goto();

  await test.step('Apply the category filter', async () => {
    await homePage.filterByCategory(categoryName);
    await expect(homePage.categoryCheckbox(categoryName)).toBeChecked();
    await expect(homePage.productNames.first()).toBeVisible();
  });

  await test.step('Open a product from the selected category', async () => {
    await homePage.openFirstProduct();
    await expect(productDetailsPage.categoryBadge).toHaveText(categoryName);
  });
});

test('restores the first page after removing the category filter @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const { categoryName } = categoryFilterData;
  await homePage.goto();
  const initialProductNames = (await homePage.productNames.allTextContents())
    .map((name) => name.trim())
    .sort();

  await test.step('Apply and remove the category filter', async () => {
    await homePage.filterByCategory(categoryName);
    await expect(homePage.categoryCheckbox(categoryName)).toBeChecked();
    await homePage.removeCategoryFilter(categoryName);
  });

  await test.step('See the original unfiltered first page', async () => {
    await expect(homePage.categoryCheckbox(categoryName)).not.toBeChecked();
    await expect
      .poll(async () =>
        (await homePage.productNames.allTextContents())
          .map((name) => name.trim())
          .sort(),
      )
      .toEqual(initialProductNames);
  });
});
