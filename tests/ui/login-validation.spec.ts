import { expect, test } from '@playwright/test';
import { loginValidationCases } from '../../src/data/loginValidationCases';
import { LoginPage } from '../../src/pages/LoginPage';

for (const {
  title,
  credentials,
  errorField,
  expectedError,
} of loginValidationCases) {
  test(`login ${title} @regression`, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Submit login details', async () => {
      await loginPage.goto();
      await loginPage.login(credentials);
    });

    await test.step('See the field validation error', async () => {
      const error =
        errorField === 'email' ? loginPage.emailError : loginPage.passwordError;
      await expect(error).toHaveText(expectedError);
      await expect(page).toHaveURL(/\/auth\/login$/);
    });
  });
}
