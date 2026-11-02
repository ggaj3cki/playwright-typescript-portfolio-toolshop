export type LoginCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type TestAccount = LoginCredentials &
  Readonly<{
    firstName: string;
    lastName: string;
  }>;

// Public demo accounts: https://github.com/testsmith-io/practice-software-testing#default-accounts
export const validLoginCredentials = {
  admin: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  customer: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'customer@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  customer2: {
    firstName: 'Jack',
    lastName: 'Howe',
    email: 'customer2@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  customer3: {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'customer3@practicesoftwaretesting.com',
    password: 'pass123',
  },
} as const satisfies Record<string, TestAccount>;
