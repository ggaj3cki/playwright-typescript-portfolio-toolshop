import type { Page } from '@playwright/test';
import type { LoginCredentials } from '../data/loginCredentials';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.page.getByTestId('email').fill(credentials.email);
    await this.page.getByTestId('password').fill(credentials.password);
    await this.page.getByTestId('login-submit').click();
  }
}
