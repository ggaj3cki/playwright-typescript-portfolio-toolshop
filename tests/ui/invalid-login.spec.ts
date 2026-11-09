import { expect, test } from '@playwright/test';
import { createInvalidLoginCredentials } from '../../src/data/invalidLoginCredentials';
import { LoginPage } from '../../src/pages/LoginPage';

test('user cannot log in with invalid credentials @regression', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  await test.step('Attempt to log in with invalid credentials', async () => {
    await loginPage.goto();
    await loginPage.login(createInvalidLoginCredentials());
  });

  await test.step('See invalid credentials error', async () => {
    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});
