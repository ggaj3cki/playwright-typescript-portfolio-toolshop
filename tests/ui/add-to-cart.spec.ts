import { expect, test } from '@playwright/test';
import { CartPage } from '../../src/pages/CartPage';
import { HomePage } from '../../src/pages/HomePage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';

function priceInCents(text: string): number {
  const match = /^\$?(\d+|\d{1,3}(?:,\d{3})+)\.(\d{2})$/.exec(text.trim());
  if (!match) throw new Error(`Unexpected price format: ${text}`);
  return Number(match[1].replaceAll(',', '')) * 100 + Number(match[2]);
}

test('adds a catalog product to the guest cart @smoke @ui', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const detailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  const product =
    await test.step('Choose an available catalog product', async () => {
      await homePage.goto();
      await homePage.openFirstProduct();
      await expect(detailsPage.name).toBeVisible();
      await expect(detailsPage.unitPrice).toBeVisible();
      await expect(
        detailsPage.addToCartButton,
        'first listed product is out of stock',
      ).toBeEnabled();
      await expect(detailsPage.quantity).toHaveValue('1');
      return {
        name: (await detailsPage.name.innerText()).trim(),
        unitPriceCents: priceInCents(await detailsPage.unitPrice.innerText()),
      };
    });

  await test.step('Add the product to the cart', async () => {
    await detailsPage.addToCart();
  });

  await test.step('See the cart confirmation and item count', async () => {
    await expect(cartPage.cartQuantity).toHaveText('1');
    await expect(detailsPage.addedAlert).toHaveText(
      'Product added to shopping cart.',
    );
  });

  await test.step('See the product and correct totals in the cart', async () => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.productName).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue('1');
    const quantity = Number(await cartPage.quantity.inputValue());
    expect(priceInCents(await cartPage.unitPrice.innerText())).toBe(
      product.unitPriceCents,
    );
    const linePriceCents = priceInCents(await cartPage.linePrice.innerText());
    expect(linePriceCents).toBe(product.unitPriceCents * quantity);
    expect(priceInCents(await cartPage.total.innerText())).toBe(linePriceCents);
  });
});
