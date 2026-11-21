import type { CurrentUser, LoginResponse } from '../../src/api/UsersApi';
import { expect, test } from '../../src/fixtures/apiFixtures';
import { invalidAuthToken } from '../../src/data/invalidAuthToken';
import { createInvalidLoginCredentials } from '../../src/data/invalidLoginCredentials';
import { validLoginCredentials } from '../../src/data/loginCredentials';

function expectErrorBody(
  body: Record<string, unknown>,
  field: 'error' | 'message',
): void {
  expect(Object.keys(body)).toEqual([field]);
  expect(typeof body[field] === 'string' && body[field].length > 0).toBe(true);
  expect('access_token' in body).toBe(false);
  expect('email' in body).toBe(false);
}

test('logs in with valid credentials and reads the current user @smoke @api', async ({
  usersApi,
}) => {
  const credentials = validLoginCredentials.customer2;

  const token = await test.step('Log in as a customer', async () => {
    const response = await usersApi.login(credentials);
    expect(
      response.status(),
      'Login failed: if 423, the shared-instance account is locked (environment issue, not a product defect)',
    ).toBe(200);
    const body = (await response.json()) as LoginResponse;
    expect(
      typeof body.access_token === 'string' && body.access_token.length > 0,
    ).toBe(true);
    expect(body.token_type).toBe('bearer');
    expect(typeof body.expires_in).toBe('number');
    expect(Number.isFinite(body.expires_in)).toBe(true);
    expect(body.expires_in).toBeGreaterThan(0);
    return body.access_token;
  });

  await test.step('Read the current customer profile', async () => {
    const response = await usersApi.getCurrentUser(token);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as CurrentUser;
    expect(body.email).toBe(credentials.email);
  });
});

test('rejects login with invalid credentials @regression @api', async ({
  usersApi,
}) => {
  await test.step('Log in with a synthetic account', async () => {
    const response = await usersApi.login(createInvalidLoginCredentials());
    expect(response.status()).toBe(401);
    const body = (await response.json()) as Record<string, unknown>;
    expectErrorBody(body, 'error');
  });
});

const unauthenticatedCases = [
  { name: 'no authorization header', token: undefined },
  { name: 'an invalid token', token: invalidAuthToken },
] as const;

for (const authCase of unauthenticatedCases) {
  test(`rejects current user access with ${authCase.name} @regression @api`, async ({
    usersApi,
  }) => {
    await test.step('Request the protected customer profile', async () => {
      const response = await usersApi.getCurrentUser(authCase.token);
      expect(response.status()).toBe(401);
      const body = (await response.json()) as Record<string, unknown>;
      expectErrorBody(body, 'message');
    });
  });
}
