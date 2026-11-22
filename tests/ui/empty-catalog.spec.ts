import { expect, test } from '@playwright/test';
import { emptyProductsPage } from '../../src/data/mockedProducts';
import { HomePage } from '../../src/pages/HomePage';
import { mockProductsResponse } from '../../src/pages/responseMocks';

test('shows an empty state when the catalog has no products @regression @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);

  const mock = await test.step('Provide an empty product catalog', () =>
    mockProductsResponse(page, emptyProductsPage));

  await test.step('Browse the shop home page', () => homePage.goto());

  await test.step('See the empty catalog state', async () => {
    await expect(homePage.noResults).toHaveText('There are no products found.');
    await expect(homePage.productNames).toHaveCount(0);
    expect(mock.fulfilledRequests).toBe(1);
  });
});
