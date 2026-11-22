# AGENTS.md

QA automation portfolio: Playwright Test + TypeScript.
SUT: Practice Software Testing – Toolshop (Sprint 5), https://practicesoftwaretesting.com/ — a public, shared instance.
API: https://api.practicesoftwaretesting.com — the stable instance without the intentional bugs; do not point tests at other Toolshop instances. Docs: https://api.practicesoftwaretesting.com/api/documentation

## Commands
- Install: `npm ci`
- All tests: `npm test` (`api` + `chromium`) · every configured browser: `npm run test:all`
- By layer: `npm run test:api` · `npm run test:ui` · `npm run test:e2e` · smoke: `npm run test:smoke`
- Single spec: `npx playwright test <path/to/spec.ts> --project=<project>`
- Projects: `api` runs `tests/api/` (no browser); `chromium`, `firefox`, `webkit` run `tests/ui/` and `tests/e2e/`
- By tag: `npx playwright test --grep @smoke`
- Lint / format / types: `npm run lint` · `npm run format` · `npm run format:check` · `npm run typecheck`
- Report: `npm run report` (the HTML report is generated but not opened automatically)
- Reporting: list output in the terminal; trace and screenshot are kept for failed tests (`npx playwright show-trace <trace.zip>`); no retries are configured, so `--reporter=line` and `--trace on` are not needed

## Project layout
- `tests/ui/`, `tests/api/`, `tests/e2e/` — one layer per spec, never mixed
- `src/pages/` — Page Objects and `responseWaits.ts` (shared wait for a response by method and path); UI specs never use raw locators
- `src/api/` — API clients built on `APIRequestContext`; they use relative paths, and the base URL and `Accept: application/json` come from the fixture context
- `src/fixtures/` — `apiFixtures.ts` (API context, clients, `cart`, `trackCartForCleanup`; used by `tests/api/`), `catalogFixtures.ts` (UI product fixtures; used by `tests/ui/`), `index.ts` (merges both; used by `tests/e2e/`)
- `src/data/` — test data builders; no hardcoded data in specs
- `src/utils/` — pure, UI-agnostic helpers (e.g. price parsing); no locators, no Playwright objects
- No `.env` is required today; `.env.example` is a placeholder for future non-secret settings (a real `.env` is gitignored)

## Conventions
- Locator priority: `getByRole` > `getByTestId` > `getByLabel`. No CSS chains or XPath.
- Toolshop exposes `data-test` attributes; keep `testIdAttribute: 'data-test'` in `playwright.config.ts`.
- Auth: if an authenticated UI flow is added, log in via the API in setup and reuse `storageState` (no such flow exists yet). UI login only in login tests.
- Each test creates the data it needs; no dependence on other tests, order, or pre-existing records.
- `test.step()` names describe business actions ("Add product to cart"), not clicks.
- Tags: `@smoke`, `@regression`, `@api`, `@ui`, `@e2e`
- ESLint enforces the project rules: no `waitForTimeout`, `networkidle` or `.only`; no raw locators in UI/E2E specs; layer import boundaries (UI specs use `catalogFixtures`, API specs use `apiFixtures`, E2E specs use `index`); `src/utils` free of Playwright. Fix the cause instead of disabling a rule.
- Guest carts: API and E2E tests delete the carts they create through the `cart` and `trackCartForCleanup` fixtures. The UI cart specs currently leave their guest carts (known limitation).
- Line endings: LF; enforced by `.gitattributes`, `.editorconfig` and Prettier (`endOfLine: lf`).

## Don't
- Don't use `waitForTimeout`, raise global timeouts, or add `retries` to hide flakiness — find the root cause.
- Don't weaken or remove assertions to make a test pass.
- Don't add dependencies or configure MCP servers without asking.
- Don't commit, push, open PRs, or run `git reset --hard` / `git clean -fd` without asking.
- Don't put secrets in code, logs, fixtures, or snapshots — read them from env.

## Shared environment
- The instance is shared: use synthetic data, avoid bulk or load-like request loops, don't modify the default seeded accounts.

## Known app quirks
- The product catalog is seeded and effectively read-only for tests. Tests read it and derive expectations dynamically (no hardcoded product lists or IDs). This is a deliberate exception to "each test creates the data it needs".
- The public instance may show a security (Cloudflare) challenge. If it or an outage blocks verification, stop and report instead of assuming behavior.
- Wrong-password scenarios use synthetic, non-existent accounts only, to avoid risking lockout of seeded accounts.
- API: Toolshop API 5.0.0 (Swagger), verified 12.11.2026 against Sprint 5. `by_category` takes a leaf category id; a parent id returns an empty list. Search is case-insensitive and name-based (a keyword present only in a description returns no results). `/products` accepts GET and QUERY.
- Auth API: POST /users/login returns access_token, token_type: bearer and expires_in: 300; a failed login returns 401 with an error field, while GET /users/me without or with an invalid token returns 401 with a message field (different keys). No throttling signals were observed.
- Seeded demo accounts are public and shared; a login can fail with 423 (locked) or a changed password because of other users. The credentials are public and the lockout was also observed in manual testing: treat a 423 as an environment limitation, not a product defect. Keep logins to the minimum (one per run) and never send wrong passwords for seeded accounts.
- Cart API: add and update quantity validation depends on the `Accept` header — with `Accept: application/json` an out-of-range quantity (`0`, `100`, `-1`) returns 422 with `errors.quantity`; without it the API answers 302 with an HTML page. `PUT /carts/{id}/product/quantity` replaces the quantity and returns `result` (Swagger documents `success`). `DELETE /carts/{id}/product/{productId}` returns 204 (also for a product that is not in the cart); `DELETE /carts/{id}` returns 204. A cart read returns no line totals. The API fixture context sends `Accept: application/json` on every request; `APIRequestContext` follows the 302 redirect, so a request without the header ends on the redirect target (a 404 in a mutation run) instead of the 422 validation error.
- Product availability on the shared instance changes (the first listed product was once out of stock). Out-of-stock cards carry `data-test="out-of-stock"`, which matches `in_stock: false` in the API and a disabled add button on the details page. `chooseAvailableProduct` skips such cards, still expects an enabled add button on the details page, and fails with "No available product among the N listed products" when none is available. Treat that failure as an environment limitation; do not mask it.

## Done means
- Specs touched by the change pass locally; new tests pass with `--repeat-each=3`.
- Lint, typecheck and format check are clean.
- Final summary: what changed, what was run and the result, what was skipped and why. Never report a check as passed unless it actually ran.

## Communication
- Reply to the user in Polish. Code, comments, commit messages, and test titles in English.
