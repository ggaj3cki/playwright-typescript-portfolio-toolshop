import type { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly categoryBadge: Locator;
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly addedAlert: Locator;

  constructor(private readonly page: Page) {
    this.categoryBadge = page.getByLabel('category');
    this.name = page.getByRole('heading', { level: 1 });
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByRole('spinbutton', { name: 'Quantity' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.addedAlert = page.getByRole('alert');
  }

  productId(): string {
    const match = /^\/product\/([^/]+)$/.exec(
      new URL(this.page.url()).pathname,
    );
    if (!match) throw new Error('Product details URL has no product id');
    return decodeURIComponent(match[1]);
  }

  async addToCart(): Promise<string> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /^\/carts\/[^/]+$/.test(new URL(response.url()).pathname),
    );
    await this.addToCartButton.click();
    const response = await responsePromise;
    await response.finished();
    return decodeURIComponent(new URL(response.url()).pathname.split('/')[2]);
  }
}
