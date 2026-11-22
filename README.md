# Playwright TypeScript Automation Portfolio

A QA Automation portfolio project focused on designing, implementing, and maintaining automated tests using **Playwright Test and TypeScript**.

The project uses a realistic e-commerce application to demonstrate test automation techniques, software testing principles, and maintainable test architecture.

## Application under test

**Practice Software Testing — Toolshop (Sprint 5)**

Toolshop is a demo e-commerce application designed for software testing practice. It provides a web interface and REST API, making it suitable for testing individual features and complete business workflows.

- **Web Application:** https://practicesoftwaretesting.com/
- **REST API:** https://api.practicesoftwaretesting.com/
- **API Documentation:** https://api.practicesoftwaretesting.com/api/documentation

## Technology stack

- **TypeScript** — programming language
- **Playwright Test** — test automation framework
- **Node.js / npm** — runtime and dependency management
- **GitHub Actions** — continuous integration
- **Git / GitHub** — version control

## Test layers

| Layer | Coverage | Specs | Project |
| --- | --- | --- | --- |
| API | Catalog, search, authentication, and guest cart endpoints | [`tests/api/`](tests/api/) | `api` |
| UI | Login, catalog browsing, and guest cart behavior | [`tests/ui/`](tests/ui/) | `chromium` |
| E2E | UI behavior checked against independent API data | [`tests/e2e/`](tests/e2e/) | `chromium` |

See [test coverage](docs/test-coverage.md) for each spec's checks and limits. Firefox and WebKit projects are configured; this document does not claim execution results for them.

## Project structure

```text
tests/api/       API endpoint specs
tests/ui/        Browser interaction specs
tests/e2e/       UI and API comparison specs
src/api/         API request clients
src/pages/       Page Objects, response waits, and response mocks
src/fixtures/    API fixtures, catalog fixtures built on them, and the E2E entry point
src/data/        Test inputs and data builders
src/utils/       Pure helpers, including price conversion
docs/            Public test coverage documentation
```

## Getting started

Use Node.js 22 (see [`.nvmrc`](.nvmrc)) and npm. Install dependencies and Playwright browsers:

```bash
npm ci
npx playwright install
```

The current tests do not require a `.env` file; [`.env.example`](.env.example) is a placeholder for future non-secret settings.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the `api` and `chromium` projects |
| `npm run test:all` | Run every configured project, including Firefox and WebKit |
| `npm run test:api` | Run API specs without a browser |
| `npm run test:ui` | Run UI specs in Chromium |
| `npm run test:e2e` | Run E2E specs in Chromium |
| `npm run test:smoke` | Run `@smoke` tests in API and Chromium |
| `npx playwright test tests/ui/sort-products.spec.ts --project=chromium` | Run one browser spec |
| `npx playwright test tests/api/carts.spec.ts --project=api` | Run one API spec |
| `npm run report` | Open the generated HTML report |

The `api` project uses API requests without a browser. The `chromium` project runs UI and E2E specs. Playwright uses list output in the terminal and generates an HTML report without opening it automatically. Failed tests retain a trace and screenshot; open a trace with `npx playwright show-trace <trace.zip>`. No retries are configured.

## Quality checks

| Command | Check |
| --- | --- |
| `npm run lint` | ESLint and project rules |
| `npm run typecheck` | TypeScript types without emitting files |
| `npm run format:check` | Prettier for TypeScript, JavaScript modules, and JSON |

ESLint prevents focused tests, arbitrary time waits, `networkidle`, raw locators in UI/E2E specs, and imports across restricted test layers. It also keeps `src/utils/` independent of Playwright.

## Continuous integration

The [`code-checks` workflow](.github/workflows/code-checks.yml) runs lint, type checking, and formatting checks on pushes and pull requests to `main` or `master`. Browser tests are excluded because the shared public site can present a security challenge to hosted runners.

## Test environment

The suite targets the shared public Toolshop instance. The seeded product catalog is treated as read-only, and tests derive expected products from catalog responses. Negative authentication uses synthetic accounts; seeded demo accounts are never modified. A public demo account may return HTTP 423 or have changed credentials because other users share the instance; that is an environment limitation, not evidence of a product defect.

API cart specs create and delete their own guest carts. The E2E and UI cart specs register their carts created through the UI for API cleanup in fixture teardown. No test places an order or completes checkout.

## AI-assisted development

AI-assisted development tools may be used to support test design, implementation, refactoring, debugging, and technical reviews.

AI-generated changes are subject to review and verification. The goal is to use AI as an engineering tool while maintaining control over code quality, architecture, and testing decisions.

Repository-specific agent instructions are maintained in `AGENTS.md`.

## Project goals

This portfolio is intended to demonstrate practical QA Automation engineering skills through realistic test scenarios and maintainable code.

The focus is on **test quality, reliability, clear architecture, and effective automation practices**, rather than maximizing the number of tests or dependencies.

## License

This repository uses the [ISC License](LICENSE).

---

**Disclaimer:** This is an independent QA Automation portfolio project. The Toolshop application is maintained by its respective creators and is used here exclusively as a system under test.
