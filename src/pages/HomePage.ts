import type { Locator, Page, Response } from '@playwright/test';

export class HomePage {
  readonly productNames: Locator;
  readonly searchCaption: Locator;
  readonly searchResultCount: Locator;
  readonly noResults: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResults = page.getByTestId('no-results');
  }

  async goto(): Promise<void> {
    const responsePromise = this.productsResponse('/products');
    await this.page.goto('/');
    await this.waitForRenderedProducts(await responsePromise);
  }

  async firstProductName(): Promise<string> {
    return (await this.productNames.first().innerText()).trim();
  }

  async search(query: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(query);
    const responsePromise = this.productsResponse('/products/search');
    await this.page.getByTestId('search-submit').click();
    await this.waitForRenderedProducts(await responsePromise);
  }

  categoryCheckbox(categoryName: string): Locator {
    return this.page.getByRole('checkbox', { name: categoryName, exact: true });
  }

  async filterByCategory(categoryName: string): Promise<void> {
    const responsePromise = this.productsResponse('/products');
    await this.categoryCheckbox(categoryName).check();
    await this.waitForRenderedProducts(await responsePromise);
  }

  async removeCategoryFilter(categoryName: string): Promise<void> {
    const responsePromise = this.productsResponse('/products');
    await this.categoryCheckbox(categoryName).uncheck();
    await this.waitForRenderedProducts(await responsePromise);
  }

  async openFirstProduct(): Promise<void> {
    await this.productNames.first().click();
  }

  private productsResponse(path: string): Promise<Response> {
    return this.page.waitForResponse(
      (response) =>
        response.request().method() === 'QUERY' &&
        new URL(response.url()).pathname === path,
    );
  }

  private async waitForRenderedProducts(response: Response): Promise<void> {
    const result = (await response.json()) as { data: unknown[] };
    await this.page.waitForFunction(
      (expectedCount) =>
        document.querySelectorAll('[data-test="product-name"]').length ===
        expectedCount,
      result.data.length,
    );
  }
}
