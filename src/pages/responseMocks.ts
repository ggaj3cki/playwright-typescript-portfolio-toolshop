import type { Page } from '@playwright/test';
import { API_BASE_URL } from '../api/apiBaseUrl';

export async function mockProductsResponse(
  page: Page,
  body: unknown,
): Promise<{ matchedRequests: number }> {
  const mock = { matchedRequests: 0 };
  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    if (
      request.method() !== 'QUERY' ||
      new URL(request.url()).pathname !== '/products'
    ) {
      await route.fallback();
      return;
    }
    // The counter proves that the mock was used.
    mock.matchedRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return mock;
}
