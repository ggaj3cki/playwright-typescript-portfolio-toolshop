# AGENTS.md

QA automation portfolio: Playwright Test + TypeScript.
SUT: Practice Software Testing – Toolshop (Sprint 5), https://practicesoftwaretesting.com/ — a public, shared instance.

## Commands
- Install: `npm ci`
- All tests: `npx playwright test`
- Single spec: `npx playwright test <path/to/spec.ts> --project=<project>`
- By tag: `npx playwright test --grep @smoke`
- Lint / format / types: `npm run lint` · `npm run format` · `npm run format:check` · `npm run typecheck`
- Report: `npx playwright show-report`

## Project layout
<!-- TODO: adjust to real paths -->
- `tests/ui/`, `tests/api/`, `tests/e2e/` — one layer per spec, never mixed
- `src/pages/` — Page Objects; UI specs never use raw locators
- `src/api/` — API clients built on `APIRequestContext`
- `src/fixtures/` — custom fixtures (auth state, API clients, page objects)
- `src/data/` — test data builders; no hardcoded data in specs
- Env config in `.env` (gitignored); template in `.env.example`

## Conventions
- Locator priority: `getByRole` > `getByTestId` > `getByLabel`. No CSS chains or XPath.
- Toolshop exposes `data-test` attributes; keep `testIdAttribute: 'data-test'` in `playwright.config.ts`. <!-- verify -->
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

## Done means
- Specs touched by the change pass locally; new tests pass with `--repeat-each=3`.
- Lint and typecheck are clean.
- Final summary: what changed, what was run and the result, what was skipped and why. Never report a check as passed unless it actually ran.

## Communication
- Reply to the user in Polish. Code, comments, commit messages, and test titles in English.
