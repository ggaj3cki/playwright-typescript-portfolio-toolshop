import type { Locator, Page } from '@playwright/test';

export class AdminDashboardPage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.pageTitle = page.getByTestId('page-title');
  }
}
