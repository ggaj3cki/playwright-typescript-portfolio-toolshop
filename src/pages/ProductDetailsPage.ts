import type { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly categoryBadge: Locator;

  constructor(page: Page) {
    this.categoryBadge = page.getByLabel('category');
  }
}
