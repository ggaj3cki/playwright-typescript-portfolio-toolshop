import { expect, test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { parsePriceInCents } from '../utils/price';

export interface CatalogProduct {
  id: string;
  name: string;
  unitPriceCents: number;
}

interface CatalogFixtures {
  chooseAvailableProduct: (options?: {
    searchTerm?: string;
  }) => Promise<CatalogProduct>;
  addAvailableProductToCart: () => Promise<CatalogProduct>;
}

export const test = base.extend<CatalogFixtures>({
  chooseAvailableProduct: async ({ page }, use) => {
    await use(async (options) => {
      const homePage = new HomePage(page);
      const detailsPage = new ProductDetailsPage(page);
      await homePage.goto();
      if (options?.searchTerm !== undefined)
        await homePage.search(options.searchTerm);
      await homePage.openFirstProduct();
      await expect(detailsPage.name).toBeVisible();
      await expect(detailsPage.unitPrice).toBeVisible();
      await expect(
        detailsPage.addToCartButton,
        'first listed product is out of stock',
      ).toBeEnabled();
      await expect(detailsPage.quantity).toHaveValue('1');
      return {
        id: detailsPage.productId(),
        name: (await detailsPage.name.innerText()).trim(),
        unitPriceCents: parsePriceInCents(
          await detailsPage.unitPrice.innerText(),
        ),
      };
    });
  },

  addAvailableProductToCart: async ({ page, chooseAvailableProduct }, use) => {
    await use(async () => {
      const product = await chooseAvailableProduct();
      const detailsPage = new ProductDetailsPage(page);
      const cartPage = new CartPage(page);
      await detailsPage.addToCart();
      await expect(cartPage.cartQuantity).toHaveText('1');
      return product;
    });
  },
});

export { expect };
