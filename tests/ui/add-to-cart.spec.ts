import { expect, test } from '../../src/fixtures/catalogFixtures';
import { CartPage } from '../../src/pages/CartPage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';
import { cartPriceTextPattern, parsePriceInCents } from '../../src/utils/price';

test('adds a catalog product to the guest cart @smoke @ui', async ({
  page,
  chooseAvailableProduct,
  trackCartForCleanup,
}) => {
  const detailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  const product = await test.step('Choose an available catalog product', () =>
    chooseAvailableProduct());

  await test.step('Add the product to the cart', async () => {
    const cartId = await detailsPage.addToCart();
    trackCartForCleanup(cartId);
  });

  await test.step('See the cart confirmation and item count', async () => {
    await expect(detailsPage.addedAlert).toHaveText(
      'Product added to shopping cart.',
    );
    await expect(cartPage.cartQuantity).toHaveText('1');
  });

  await test.step('See the product and correct totals in the cart', async () => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.productName).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue('1');
    const quantity = Number(await cartPage.quantity.inputValue());
    await expect(cartPage.unitPrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.unitPrice.innerText()))
      .toBe(product.unitPriceCents);
    const expectedLinePriceCents = product.unitPriceCents * quantity;
    await expect(cartPage.linePrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(expectedLinePriceCents);
    await expect(cartPage.total).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.total.innerText()))
      .toBe(expectedLinePriceCents);
  });
});
