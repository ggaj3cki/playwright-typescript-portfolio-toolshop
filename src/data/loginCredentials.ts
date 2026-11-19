export type LoginCredentials = Readonly<{
  email: string;
  password: string;
}>;

// Public Toolshop demo accounts (not secrets): https://github.com/testsmith-io/practice-software-testing#default-accounts
export const validLoginCredentials = {
  admin: {
    email: 'admin@practicesoftwaretesting.com',
    password: 'welcome01',
  },
  customer2: {
    email: 'customer2@practicesoftwaretesting.com',
    password: 'welcome01',
  },
} as const satisfies Record<string, LoginCredentials>;
