import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { LoginCredentials } from '../data/loginCredentials';
import { API_BASE_URL } from './apiBaseUrl';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CurrentUser {
  email: string;
}

export class UsersApi {
  constructor(private readonly request: APIRequestContext) {}

  async login(credentials: LoginCredentials): Promise<APIResponse> {
    return this.request.post(new URL('/users/login', API_BASE_URL).toString(), {
      data: credentials,
    });
  }

  async getCurrentUser(token?: string): Promise<APIResponse> {
    try {
      return await this.request.get(
        new URL('/users/me', API_BASE_URL).toString(),
        {
          ...(token !== undefined && {
            headers: { Authorization: `Bearer ${token}` },
          }),
        },
      );
    } catch (error) {
      if (token === undefined) throw error;
      const message = error instanceof Error ? error.message : String(error);
      // The original cause can expose the Authorization header and its token.
      // eslint-disable-next-line preserve-caught-error
      throw new Error(message.replaceAll(token, '[REDACTED]'));
    }
  }
}
