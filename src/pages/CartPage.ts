import type { Locator, Page } from '@playwright/test';
import { waitForResponseTo } from './responseWaits';

const cartPath = /^\/carts\/[^/]+$/;
const quantityPath = /^\/carts\/[^/]+\/product\/quantity$/;
const productPath = /^\/carts\/[^/]+\/product\/[^/]+$/;

export class CartPage {
  readonly cartQuantity: Locator;
  readonly rows: Locator;
  readonly productName: Locator;
  readonly quantity: Locator;
  readonly unitPrice: Locator;
  readonly linePrice: Locator;
  readonly total: Locator;
  readonly removeControl: Locator;
  readonly emptyCart: Locator;
  private readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.getByRole('link', { name: 'cart' });
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.rows = page.getByRole('row').filter({
      has: page.getByTestId('product-title'),
    });
    this.productName = this.rows.getByTestId('product-title');
    this.quantity = this.rows.getByTestId('product-quantity');
    this.unitPrice = this.rows.getByTestId('product-price');
    this.linePrice = this.rows.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
    // The remove anchor has no accessible name or test id, so use the row's last cell.
    this.removeControl = this.rows.getByRole('cell').last().locator('a');
    this.emptyCart = page.getByText('The cart is empty. Nothing to display.', {
      exact: true,
    });
  }

  async open(): Promise<void> {
    if (!(await this.cartLink.isVisible())) {
      await this.page
        .getByRole('button', { name: 'Toggle navigation' })
        .click();
    }
    const responsePromise = waitForResponseTo(this.page, 'GET', cartPath);
    await this.cartLink.click();
    await (await responsePromise).finished();
  }

  async changeQuantity(quantity: number): Promise<void> {
    // Waiting for a changed total requires a different quantity.
    if (Number(await this.quantity.inputValue()) === quantity) {
      throw new Error(`Cart quantity is already ${quantity}`);
    }
    const previousTotal = await this.total.innerText();
    const updateResponse = waitForResponseTo(this.page, 'PUT', quantityPath);
    const refreshResponse = waitForResponseTo(this.page, 'GET', cartPath);
    await this.quantity.fill(String(quantity));
    await this.quantity.press('Tab');
    await (await updateResponse).finished();
    await (await refreshResponse).finished();
    await this.page.waitForFunction(
      (oldTotal) =>
        document
          .querySelector('[data-test="cart-total"]')
          ?.textContent?.trim() !== oldTotal,
      previousTotal.trim(),
    );
  }

  async removeProduct(): Promise<void> {
    const removeResponse = waitForResponseTo(this.page, 'DELETE', productPath);
    const refreshResponse = waitForResponseTo(this.page, 'GET', cartPath);
    await this.removeControl.click();
    await (await removeResponse).finished();
    await (await refreshResponse).finished();
    await this.emptyCart.waitFor({ state: 'visible' });
  }

  async reload(): Promise<void> {
    const responsePromise = waitForResponseTo(this.page, 'GET', cartPath);
    await this.page.reload();
    await (await responsePromise).finished();
  }
}
