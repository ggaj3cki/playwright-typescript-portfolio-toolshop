import type { Page, Response } from '@playwright/test';

export function waitForResponseTo(
  page: Page,
  method: string,
  path: string | RegExp,
): Promise<Response> {
  return page.waitForResponse((response) => {
    const responsePath = new URL(response.url()).pathname;
    return (
      response.request().method() === method &&
      (typeof path === 'string'
        ? responsePath === path
        : path.test(responsePath))
    );
  });
}
