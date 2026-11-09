import type { Locator, Page } from '@playwright/test';
import type { LoginCredentials } from '../data/loginCredentials';

export class LoginPage {
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly loginError: Locator;

  constructor(private readonly page: Page) {
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
    this.loginError = page.getByTestId('login-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.page.getByTestId('email').fill(credentials.email);
    await this.page.getByTestId('password').fill(credentials.password);
    await this.page.getByTestId('login-submit').click();
  }
}
