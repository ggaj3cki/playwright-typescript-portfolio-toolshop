import { mergeTests } from '@playwright/test';
import { test as apiTest } from './apiFixtures';
import { test as catalogTest } from './catalogFixtures';

export const test = mergeTests(apiTest, catalogTest);
export { expect } from '@playwright/test';
