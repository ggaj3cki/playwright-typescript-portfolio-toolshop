import { expect, test } from '../../src/fixtures/catalogFixtures';
import { cartData } from '../../src/data/cartData';
import { CartPage } from '../../src/pages/CartPage';
import { cartPriceTextPattern, parsePriceInCents } from '../../src/utils/price';

test('updates line and cart totals after changing quantity @regression @ui', async ({
  page,
  addAvailableProductToCart,
}) => {
  const cartPage = new CartPage(page);
  const product =
    await test.step('Add an available product to the guest cart', () =>
      addAvailableProductToCart());

  await test.step('Change the product quantity in the cart', async () => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await cartPage.changeQuantity(cartData.updatedQuantity);
  });

  await test.step('See the updated quantity and totals', async () => {
    await expect(cartPage.productName).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue(
      String(cartData.updatedQuantity),
    );
    await expect(cartPage.unitPrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.unitPrice.innerText()))
      .toBe(product.unitPriceCents);
    const expectedTotal = product.unitPriceCents * cartData.updatedQuantity;
    await expect(cartPage.linePrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.total).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.total.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.cartQuantity).toHaveText(
      String(cartData.updatedQuantity),
    );
  });

  await test.step('Keep the updated cart after reloading', async () => {
    await cartPage.reload();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.productName).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue(
      String(cartData.updatedQuantity),
    );
    const expectedTotal = product.unitPriceCents * cartData.updatedQuantity;
    await expect(cartPage.linePrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.total).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.total.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.cartQuantity).toHaveText(
      String(cartData.updatedQuantity),
    );
  });
});

test('removes a product from the guest cart @regression @ui', async ({
  page,
  addAvailableProductToCart,
}) => {
  const cartPage = new CartPage(page);
  await test.step('Add an available product to the guest cart', () =>
    addAvailableProductToCart());

  await test.step('Remove the product from the cart', async () => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await cartPage.removeProduct();
  });

  await test.step('See an empty cart', async () => {
    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyCart).toBeVisible();
    await expect(cartPage.cartQuantity).toHaveCount(0);
    await expect(cartPage.total).toHaveCount(0);
  });

  await test.step('Keep the cart empty after reloading', async () => {
    await cartPage.reload();
    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyCart).toBeVisible();
    await expect(cartPage.cartQuantity).toHaveCount(0);
    await expect(cartPage.total).toHaveCount(0);
  });
});
