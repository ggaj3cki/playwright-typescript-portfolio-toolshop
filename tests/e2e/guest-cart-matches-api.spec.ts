import type { Cart } from '../../src/api/CartsApi';
import type { ProductDetails } from '../../src/api/ProductsApi';
import { productSearchData } from '../../src/data/productSearchData';
import { expect, test } from '../../src/fixtures/index';
import { CartPage } from '../../src/pages/CartPage';
import { ProductDetailsPage } from '../../src/pages/ProductDetailsPage';
import {
  cartPriceTextPattern,
  dollarsToCents,
  parsePriceInCents,
} from '../../src/utils/price';

test('keeps the guest cart consistent across UI and API @smoke @e2e', async ({
  page,
  cartsApi,
  productsApi,
  chooseAvailableProduct,
  trackCartForCleanup,
}) => {
  const detailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  const product = await test.step('Find an available product by search', () =>
    chooseAvailableProduct({ searchTerm: productSearchData.keyword }));

  const capturedCartId =
    await test.step('Add the selected product to the guest cart', async () => {
      const cartId = await detailsPage.addToCart();
      trackCartForCleanup(cartId);
      await expect(detailsPage.addedAlert).toHaveText(
        'Product added to shopping cart.',
      );
      await expect(cartPage.cartQuantity).toHaveText('1');
      return cartId;
    });
  if (capturedCartId === undefined) throw new Error('Cart id was not captured');

  await test.step('Read the product and totals in the cart', async () => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.productName).toHaveText(product.name);
    await expect(cartPage.quantity).toHaveValue('1');
    await expect(cartPage.unitPrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.unitPrice.innerText()))
      .toBe(product.unitPriceCents);
    await expect(cartPage.linePrice).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.linePrice.innerText()))
      .toBe(product.unitPriceCents);
    await expect(cartPage.total).toHaveText(cartPriceTextPattern);
    await expect
      .poll(async () => parsePriceInCents(await cartPage.total.innerText()))
      .toBe(product.unitPriceCents);
  });

  await test.step('Verify the same cart through the API', async () => {
    const response = await cartsApi.getCart(capturedCartId);
    expect(response.status()).toBe(200);
    const cart = (await response.json()) as Cart;
    expect(cart.id).toBe(capturedCartId);
    expect(cart.cart_items).toHaveLength(1);
    const [item] = cart.cart_items;
    expect(item.product_id).toBe(product.id);
    expect(item.quantity).toBe(1);
    expect(dollarsToCents(item.product.price)).toBe(product.unitPriceCents);
  });

  await test.step('Compare the product with the catalog API', async () => {
    const response = await productsApi.getProduct(product.id);
    expect(response.status()).toBe(200);
    const catalogProduct = (await response.json()) as ProductDetails;
    expect(catalogProduct.id).toBe(product.id);
    expect(catalogProduct.name).toBe(product.name);
    expect(dollarsToCents(catalogProduct.price)).toBe(product.unitPriceCents);
  });
});
