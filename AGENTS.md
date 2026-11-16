# AGENTS.md

QA automation portfolio: Playwright Test + TypeScript.
SUT: Practice Software Testing – Toolshop (Sprint 5), https://practicesoftwaretesting.com/ — a public, shared instance.
API: https://api.practicesoftwaretesting.com — the stable instance without the intentional bugs; do not point tests at other Toolshop instances. Docs: https://api.practicesoftwaretesting.com/api/documentation

## Commands
- Install: `npm ci`
- All tests: `npx playwright test`
- Single spec: `npx playwright test <path/to/spec.ts> --project=<project>`
- Projects: `api` runs `tests/api/` (no browser); `chromium`, `firefox`, `webkit` run `tests/ui/` and `tests/e2e/`
- API tests: `npx playwright test --project=api` · UI/E2E tests: `npx playwright test --project=chromium`
- By tag: `npx playwright test --grep @smoke`
- Lint / format / types: `npm run lint` · `npm run format` · `npm run format:check` · `npm run typecheck`
- Report: `npx playwright show-report`

## Project layout
- `tests/ui/`, `tests/api/`, `tests/e2e/` — one layer per spec, never mixed
- `src/pages/` — Page Objects; UI specs never use raw locators
- `src/api/` — API clients built on `APIRequestContext`
- `src/fixtures/` — custom fixtures (auth state, API clients, page objects)
- `src/data/` — test data builders; no hardcoded data in specs
- `src/utils/` — pure, UI-agnostic helpers (e.g. price parsing); no locators, no Playwright objects
- Env config in `.env` (gitignored); template in `.env.example`

## Conventions
- Locator priority: `getByRole` > `getByTestId` > `getByLabel`. No CSS chains or XPath.
- Toolshop exposes `data-test` attributes; keep `testIdAttribute: 'data-test'` in `playwright.config.ts`.
- Auth: log in via API in setup and reuse `storageState`. UI login only in login tests.
- Each test creates the data it needs; no dependence on other tests, order, or pre-existing records.
- `test.step()` names describe business actions ("Add product to cart"), not clicks.
- Tags: `@smoke`, `@regression`, `@api`, `@ui`, `@e2e`

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
- Cart API: add and update quantity validation depends on the `Accept` header — with `Accept: application/json` an out-of-range quantity (`0`, `100`, `-1`) returns 422 with `errors.quantity`; without it the API answers 302 with an HTML page. `PUT /carts/{id}/product/quantity` replaces the quantity and returns `result` (Swagger documents `success`). `DELETE /carts/{id}/product/{productId}` returns 204 (also for a product that is not in the cart); `DELETE /carts/{id}` returns 204. A cart read returns no line totals.

## Done means
- Specs touched by the change pass locally; new tests pass with `--repeat-each=3`.
- Lint, typecheck and format check are clean.
- Final summary: what changed, what was run and the result, what was skipped and why. Never report a check as passed unless it actually ran.

## Communication
- Reply to the user in Polish. Code, comments, commit messages, and test titles in English.
