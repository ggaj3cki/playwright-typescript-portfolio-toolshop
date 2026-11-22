import type { Page } from '@playwright/test';
import { API_BASE_URL } from '../api/apiBaseUrl';

export async function mockProductsResponse(
  page: Page,
  body: unknown,
): Promise<{ fulfilledRequests: number }> {
  const mock = { fulfilledRequests: 0 };
  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    if (
      request.method() !== 'QUERY' ||
      new URL(request.url()).pathname !== '/products'
    ) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
    mock.fulfilledRequests += 1;
  });
  return mock;
}
