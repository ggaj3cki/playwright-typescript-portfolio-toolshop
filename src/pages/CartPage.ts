import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly cartQuantity: Locator;
  readonly rows: Locator;
  readonly productName: Locator;
  readonly quantity: Locator;
  readonly unitPrice: Locator;
  readonly linePrice: Locator;
  readonly total: Locator;
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
  }

  async open(): Promise<void> {
    if (!(await this.cartLink.isVisible())) {
      await this.page
        .getByRole('button', { name: 'Toggle navigation' })
        .click();
    }
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /^\/carts\/[^/]+$/.test(new URL(response.url()).pathname),
    );
    await this.cartLink.click();
    await (await responsePromise).finished();
  }
}
