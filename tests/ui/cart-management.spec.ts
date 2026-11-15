import { expect, test, type Page } from '@playwright/test';
import { cartData } from '../../src/data/cartData';
import { CartPage } from '../../src/pages/CartPage';
import { HomePage } from '../../src/pages/HomePage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';
import { parsePriceInCents } from '../../src/utils/price';

const cartPricePattern = /^\$(?:\d+|\d{1,3}(?:,\d{3})+)\.\d{2}$/;

async function addFirstAvailableProduct(page: Page): Promise<{
  name: string;
  unitPriceCents: number;
}> {
  const homePage = new HomePage(page);
  const detailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  await homePage.goto();
  await homePage.openFirstProduct();
  await expect(detailsPage.name).toBeVisible();
  await expect(detailsPage.unitPrice).toBeVisible();
  await expect(
    detailsPage.addToCartButton,
    'first listed product is out of stock',
  ).toBeEnabled();
  await expect(detailsPage.quantity).toHaveValue('1');
  const product = {
    name: (await detailsPage.name.innerText()).trim(),
    unitPriceCents: parsePriceInCents(await detailsPage.unitPrice.innerText()),
  };
  await detailsPage.addToCart();
  await expect(cartPage.cartQuantity).toHaveText('1');
  return product;
}

test('updates line and cart totals after changing quantity @regression @ui', async ({
  page,
}) => {
  const cartPage = new CartPage(page);
  const product =
    await test.step('Add an available product to the guest cart', () =>
      addFirstAvailableProduct(page));

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
    await expect(cartPage.unitPrice).toHaveText(cartPricePattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.unitPrice.innerText()))
      .toBe(product.unitPriceCents);
    const expectedTotal = product.unitPriceCents * cartData.updatedQuantity;
    await expect(cartPage.linePrice).toHaveText(cartPricePattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.total).toHaveText(cartPricePattern);
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
    await expect(cartPage.linePrice).toHaveText(cartPricePattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(expectedTotal);
    await expect(cartPage.total).toHaveText(cartPricePattern);
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
}) => {
  const cartPage = new CartPage(page);
  await test.step('Add an available product to the guest cart', () =>
    addFirstAvailableProduct(page));

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
