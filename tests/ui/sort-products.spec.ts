import { expect, test } from '@playwright/test';
import { productSortData } from '../../src/data/productSortData';
import { HomePage } from '../../src/pages/HomePage';
import { parsePriceInCents } from '../../src/utils/price';

test('shows first-page products by ascending price @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);

  const initial = await test.step('See the initial catalog page', async () => {
    await homePage.goto();
    return {
      names: (await homePage.productNames.allTextContents())
        .map((name) => name.trim())
        .sort(),
      prices: (await homePage.productPrices.allTextContents()).map(
        parsePriceInCents,
      ),
    };
  });

  await test.step('Sort catalog products from lowest to highest price', async () => {
    await homePage.sortBy(productSortData.ascendingPriceLabel);
  });

  await test.step('See ascending prices and a changed first page', async () => {
    await expect(homePage.sortControl).toHaveValue(
      productSortData.ascendingPriceValue,
    );
    const prices = (await homePage.productPrices.allTextContents()).map(
      parsePriceInCents,
    );
    expect(prices.length).toBeGreaterThan(1);
    expect(new Set(prices).size).toBeGreaterThan(1);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices).not.toEqual(initial.prices);

    const sortedNames = (await homePage.productNames.allTextContents())
      .map((name) => name.trim())
      .sort();
    expect(sortedNames).not.toEqual(initial.names);
  });
});
