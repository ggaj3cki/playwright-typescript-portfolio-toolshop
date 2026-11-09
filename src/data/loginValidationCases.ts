import type { LoginCredentials } from './loginCredentials';

const wellFormedEmail = 'qa-validation@example.invalid';
const validLengthPassword = 'ExamplePassword123!';

type LoginValidationCase = Readonly<{
  title: string;
  credentials: LoginCredentials;
  errorField: 'email' | 'password';
  expectedError: string;
}>;

export const loginValidationCases: readonly LoginValidationCase[] = [
  {
    title: 'requires an email address',
    credentials: { email: '', password: validLengthPassword },
    errorField: 'email',
    expectedError: 'Email is required',
  },
  {
    title: 'requires a password',
    credentials: { email: wellFormedEmail, password: '' },
    errorField: 'password',
    expectedError: 'Password is required',
  },
  {
    title: 'rejects a two-character password',
    credentials: { email: wellFormedEmail, password: 'xx' },
    errorField: 'password',
    expectedError: 'Password length is invalid',
  },
  {
    title: 'rejects a 41-character password',
    credentials: {
      email: wellFormedEmail,
      password: 'x'.repeat(41),
    },
    errorField: 'password',
    expectedError: 'Password length is invalid',
  },
  {
    title: 'rejects an invalid email format',
    credentials: {
      email: 'invalid-email',
      password: validLengthPassword,
    },
    errorField: 'email',
    expectedError: 'Email format is invalid',
  },
];
