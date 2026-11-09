import { faker } from '@faker-js/faker';
import type { LoginCredentials } from './loginCredentials';

export function createInvalidLoginCredentials(): LoginCredentials {
  return {
    email: `qa-${faker.string.uuid()}@example.invalid`,
    password: faker.internet.password({ length: 16 }),
  };
}
