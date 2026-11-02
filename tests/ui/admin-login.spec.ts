import { expect, test } from '@playwright/test';
import { validLoginCredentials } from '../../src/data/loginCredentials';
import { LoginPage } from '../../src/pages/LoginPage';

test('admin can log in @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Log in as admin', async () => {
    await loginPage.goto();
    await loginPage.login(validLoginCredentials.admin);
  });

  await test.step('See the admin dashboard', async () => {
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });
});
