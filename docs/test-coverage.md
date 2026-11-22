# Test coverage

## Scope and application

The suite tests Practice Software Testing — Toolshop (Sprint 5) at its [public web application](https://practicesoftwaretesting.com/) and [stable API](https://api.practicesoftwaretesting.com/). It covers product discovery, authentication checks, and guest cart behavior. The catalog is seeded and read-only for these tests.

This page describes assertions present in the repository. The counts below come from Playwright's test listing, not a live test run or a pass-rate claim.

## Layers and structure

| Layer | Directory | Playwright project | Main support code |
| --- | --- | --- | --- |
| API | [`tests/api/`](../tests/api/) | `api`, no browser | [`src/api/`](../src/api/) clients and [`apiFixtures.ts`](../src/fixtures/apiFixtures.ts) |
| UI | [`tests/ui/`](../tests/ui/) | `chromium` | [`src/pages/`](../src/pages/) Page Objects and [`catalogFixtures.ts`](../src/fixtures/catalogFixtures.ts) |
| E2E | [`tests/e2e/`](../tests/e2e/) | `chromium` | [`src/fixtures/index.ts`](../src/fixtures/index.ts) re-exports the catalog fixtures, which build on the API fixtures |

Firefox and WebKit projects are also configured for browser specs. Their execution results were not established for this document.

Every test has a layer tag (`@api`, `@ui`, or `@e2e`) and a purpose tag (`@smoke` or `@regression`).

## Coverage by spec

| Layer | Spec | Tests | Tags | Verifies | Deliberate boundary |
| --- | --- | ---: | --- | --- | --- |
| API | [`carts.spec.ts`](../tests/api/carts.spec.ts) | 8 | `@regression @api` | Empty cart; add, update, invalid quantities, and removal with read-back | Does not assert line totals, which the cart API does not return |
| API | [`product-details.spec.ts`](../tests/api/product-details.spec.ts) | 2 | `@regression @api` | Detail fields against a catalog product; missing product response | Does not compare every catalog product |
| API | [`products-list.spec.ts`](../tests/api/products-list.spec.ts) | 1 | `@smoke @api` | First two pages, pagination metadata, product fields, distinct IDs | Does not traverse every catalog page |
| API | [`products-search-filter.spec.ts`](../tests/api/products-search-filter.spec.ts) | 6 | `@regression @api` | Search precision and full-name recall, empty search, category and brand filters, price order | Search and filter assertions inspect page one; filter recall is conditional on the whole set fitting there; sorting uses page-one extremes |
| API | [`users-auth.spec.ts`](../tests/api/users-auth.spec.ts) | 4 | `@smoke @api`; `@regression @api` | Successful customer login/profile, synthetic invalid login, missing and invalid authorization | Does not change a seeded account |
| UI | [`add-to-cart.spec.ts`](../tests/ui/add-to-cart.spec.ts) | 1 | `@smoke @ui` | Add confirmation, cart badge, product, quantity, and displayed totals | Does not complete checkout |
| UI | [`admin-login.spec.ts`](../tests/ui/admin-login.spec.ts) | 1 | `@smoke @ui` | Admin login reaches the dashboard | Does not exercise other authenticated UI flows |
| UI | [`cart-management.spec.ts`](../tests/ui/cart-management.spec.ts) | 2 | `@regression @ui` | Quantity and totals across reload; removal and empty cart across reload | Removal test removes an item, not the cart; fixture deletes the cart in teardown |
| UI | [`empty-catalog.spec.ts`](../tests/ui/empty-catalog.spec.ts) | 1 | `@regression @ui` | Empty catalog message and zero product cards from a mocked response | Does not validate the live catalog API |
| UI | [`filter-products-by-category.spec.ts`](../tests/ui/filter-products-by-category.spec.ts) | 2 | `@regression @ui` | Category selection, product detail badge, clearing the filter | Does not compare the full category with the API |
| UI | [`invalid-login.spec.ts`](../tests/ui/invalid-login.spec.ts) | 1 | `@regression @ui` | Synthetic invalid login remains on the form and shows an error | Does not exercise seeded account lockout |
| UI | [`login-validation.spec.ts`](../tests/ui/login-validation.spec.ts) | 5 | `@regression @ui` | Required fields, email format, and length limits | Does not submit a valid login |
| UI | [`search-products.spec.ts`](../tests/ui/search-products.spec.ts) | 3 | `@regression @ui` | Full-name recall, keyword precision, and no-results state | Inspects the first displayed page |
| UI | [`sort-products.spec.ts`](../tests/ui/sort-products.spec.ts) | 1 | `@regression @ui` | Ascending displayed prices and changed first-page products | Does not assert UI order across later pages |
| E2E | [`category-filter-matches-catalog.spec.ts`](../tests/e2e/category-filter-matches-catalog.spec.ts) | 1 | `@regression @e2e` | UI category IDs against independently read API catalog data | Full recall only if results fit on one page; catalog read capped at 10 pages |
| E2E | [`guest-cart-matches-api.spec.ts`](../tests/e2e/guest-cart-matches-api.spec.ts) | 1 | `@smoke @e2e` | UI product, cart totals, cart item, and product API agree | Does not place an order or derive totals from the cart API |

**Totals:** 21 API tests in 5 files, 17 UI tests in 9 files, and 2 E2E tests in 2 files: 40 tests across the `api` and `chromium` projects.

Counts are per project: selecting more browser projects discovers the browser specs in each selected browser.

### Reading the boundaries

The API search and filter spec reads the first result page. Its full-name test requires all matches to fit on that page before checking that the selected product is present. Category and brand tests check every returned product for the requested attribute; they check presence of the source product only when the complete filtered set fits on that page.

The API price sort test checks ascending and descending order within each first page. It also compares the highest price on the ascending page with the lowest price on the descending page, after requiring a catalog large enough to span two pages. It does not enumerate every intervening page.

The category E2E test reads the unfiltered API catalog to form its expected ID set. If the filtered set fits on one displayed page, it compares the complete sets. Otherwise it checks that every displayed ID belongs to the expected category and that the page is full. This keeps the expectation independent of the filtered response being checked.

Cart UI tests derive expected totals from a product's displayed unit price and quantity. The guest-cart E2E test additionally compares that product and the cart item with API responses. Neither approach treats a cart API line total as an oracle, because that field is absent from the response.

## Design decisions

- The dedicated [`api` project](../playwright.config.ts) runs endpoint specs once without a browser, while browser projects exclude them.
- [`apiFixtures.ts`](../src/fixtures/apiFixtures.ts) creates a request context with a shared API base URL and JSON accept header, so clients can use relative paths and quantity validation receives JSON errors.
- The `cart` fixture in [`apiFixtures.ts`](../src/fixtures/apiFixtures.ts) checks creation and deletion; its teardown removes each API test's guest cart.
- UI cart cleanup runs through the API in fixture teardown after each test.
- The E2E cart test registers its cart created through the UI for cleanup in [`guest-cart-matches-api.spec.ts`](../tests/e2e/guest-cart-matches-api.spec.ts), so teardown can delete it even after a later assertion fails.
- [`catalogFixtures.ts`](../src/fixtures/catalogFixtures.ts) selects the first available listed product by skipping cards marked out of stock, still checks that its add button is enabled on the details page, and fails explicitly when no listed product is available.
- [`category-filter-matches-catalog.spec.ts`](../tests/e2e/category-filter-matches-catalog.spec.ts) builds its expected product IDs from the unfiltered API catalog, independently of the filtered UI response.
- First-page checks in [`products-search-filter.spec.ts`](../tests/api/products-search-filter.spec.ts) state when recall can be proved; category and brand checks otherwise verify only precision.
- [`sort-products.spec.ts`](../tests/ui/sort-products.spec.ts) and [`price.ts`](../src/utils/price.ts) compare displayed money as integer cents to avoid floating-point display comparisons.
- [`responseWaits.ts`](../src/pages/responseWaits.ts) synchronizes Page Objects with matching HTTP methods and URL paths instead of fixed delays.
- [`empty-catalog.spec.ts`](../tests/ui/empty-catalog.spec.ts) uses `page.route` to replace one catalog response, making the UI's empty state deterministic without changing the real API.
- Temporary, uncommitted fault injection has been used during development to check that assertions and cleanup detect failures; it is not part of the committed suite.

## Test data and environment constraints

The public instance is shared. Tests read seeded product data and derive product expectations at runtime instead of hardcoding product IDs or lists. Negative authentication uses synthetic accounts. Seeded demo accounts are not modified, but another user may change their credentials or cause HTTP 423 lockout. Treat that response as an environment limitation until investigated.

| Data | Created or read by | Cleanup or constraint |
| --- | --- | --- |
| Seeded products | API, UI, and E2E catalog tests | Read only; expectations come from current catalog data |
| API guest carts | Eight cart endpoint tests | Fixture deletes each cart in teardown |
| E2E guest cart | Guest cart comparison test | Registered for API deletion in fixture teardown |
| UI guest carts | Add-to-cart and cart-management tests | Registered for API deletion in fixture teardown |
| Synthetic login identities | Negative API and UI login tests | No seeded account receives an invalid login attempt |

The API cart specs create and delete one guest cart per test through the `cart` fixture. The guest-cart E2E spec creates a cart in the UI and registers it for API deletion. The UI add-to-cart and cart-management specs also register their guest carts for API deletion in fixture teardown; the removal test removes an item, not the cart itself. No test creates a checkout or order.

The current tests do not require a `.env` file. The [environment template](../.env.example) contains no required settings. The only `process.env` usage in the inspected source and test configuration is for CI behavior in [`playwright.config.ts`](../playwright.config.ts).

## Running tests and reading reports

Install dependencies with `npm ci` and browsers with `npx playwright install`. Use `npm run test:api` for browser-free API specs, `npm run test:ui` and `npm run test:e2e` for Chromium, or `npm test` for API plus Chromium. `npm run test:all` selects all configured projects. `npm run test:smoke` selects tagged smoke tests in API and Chromium.

The same selection can be made directly through Playwright:

```bash
npx playwright test --project=api
npx playwright test tests/ui --project=chromium
npx playwright test tests/e2e --project=chromium
npx playwright test --project=api --project=chromium --grep '@smoke'
```

The last command selects the five tests currently tagged `@smoke` across those two projects. A project option limits which specs are discovered; it does not change the assertions inside a spec.

To inspect one spec without running it, use `npx playwright test tests/api/carts.spec.ts --project=api --list` or `npx playwright test tests/ui/sort-products.spec.ts --project=chromium --list`. To see all discovered tests, use `npx playwright test --list --project=api` and `npx playwright test --list --project=chromium`.

The [Playwright configuration](../playwright.config.ts) uses list output and generates an HTML report with automatic opening disabled. Run `npm run report` to open it. Failure traces and screenshots are retained; use `npx playwright show-trace <trace.zip>` to inspect a trace. No retries are configured. The commands on this page describe how to run tests; they do not imply a successful live run.

## Continuous integration

[`code-checks.yml`](../.github/workflows/code-checks.yml) runs `npm run lint`, `npm run typecheck`, and `npm run format:check` on pushes and pull requests to `main` or `master`. Browser tests are not in that workflow because the public site may challenge hosted runners.

## Known limitations and not covered

- Checkout and orders are outside the current tests.
- Authenticated UI coverage is limited to admin login; no authenticated shopping flow is asserted.
- Firefox and WebKit are configured, but this document reports no execution results for them.
- UI search, sort, and category comparisons focus on the first displayed page; there is no UI pagination test.
- The cart API response has no line totals, so monetary totals are checked in the UI using product prices.
- If no product on the listed page is available, cart UI and E2E tests fail on an explicit precondition; shared catalog changes can still cause that.
- Shared accounts, catalog state, and a possible security challenge can block live verification independently of test logic.

## Last verified

On 2026-11-22, test counts and titles were read with `npx playwright test --list --project=api` (21) and `npx playwright test --list --project=chromium` (19); `npx playwright test --list` found 78 across all configured projects.
