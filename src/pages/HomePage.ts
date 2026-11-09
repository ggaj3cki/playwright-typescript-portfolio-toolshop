import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly productNames: Locator;
  readonly searchCaption: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.searchCaption = page.getByTestId('search-caption');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async firstProductName(): Promise<string> {
    return (await this.productNames.first().innerText()).trim();
  }

  async search(query: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(query);
    await this.page.getByTestId('search-submit').click();
  }
}
