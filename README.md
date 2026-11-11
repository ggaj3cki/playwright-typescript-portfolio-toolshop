# Playwright TypeScript Automation Portfolio

A QA Automation portfolio project focused on designing, implementing, and maintaining automated tests using **Playwright Test and TypeScript**.

The project uses a realistic e-commerce application to demonstrate test automation techniques, software testing principles, and maintainable test architecture.

## Application Under Test

**Practice Software Testing — Toolshop (Sprint 5)**

Toolshop is a demo e-commerce application designed for software testing practice. It provides a web interface and REST API, making it suitable for testing individual features and complete business workflows.

- **Web Application:** https://practicesoftwaretesting.com/
- **REST API:** https://api.practicesoftwaretesting.com/
- **API Documentation:** https://api.practicesoftwaretesting.com/api/documentation

## Technology Stack

- **TypeScript** — programming language
- **Playwright Test** — test automation framework
- **Node.js / npm** — runtime and dependency management
- **GitHub Actions** — continuous integration
- **Git / GitHub** — version control

Additional tools and libraries may be introduced when justified by the project's requirements.

## Test Automation Scope

The portfolio focuses on three complementary testing layers.

### UI Testing

Browser-based functional testing of the application, including authentication, product browsing, searching, filtering, sorting, shopping cart operations, and form validation.

### API Testing

REST API testing covering response validation, HTTP status codes, authentication, negative scenarios, and resource operations.

### End-to-End Testing

Business workflows combining multiple application features, including product discovery and shopping cart operations, verified against API data where the UI alone cannot prove correctness.

The project also explores integration between UI and API testing, such as verifying what the UI displays against data retrieved independently from the API.

## Test Architecture & Practices

The project emphasizes:

- Page Object Model (POM) where appropriate
- Reusable Page Objects, centralized test data, and a small API client
- Data-driven and parameterized testing
- Test isolation and independent execution
- Reliable locators and web-first assertions
- Meaningful test steps and assertions
- Positive and negative test scenarios
- Synchronization on network responses and API response validation
- Debugging using Playwright Trace Viewer
- Automated reporting and continuous integration
- Readable, maintainable, and scalable test code

The architecture is intentionally kept simple. Abstractions are introduced when they provide practical benefits rather than unnecessary complexity.

## Getting Started

### Prerequisites

- Node.js (a supported LTS version)
- npm
- Git

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ggaj3cki/playwright-typescript-portfolio-toolshop.git
cd playwright-typescript-portfolio-toolshop
npm ci
```

Install Playwright browsers:

```bash
npx playwright install
```

### Running Tests

Run all configured tests:

```bash
npx playwright test
```

Run tests using Chromium:

```bash
npx playwright test --project=chromium
```

Run tests with the browser visible:

```bash
npx playwright test --headed
```

Open Playwright UI Mode:

```bash
npx playwright test --ui
```

Print results in the terminal without opening the HTML report:

```bash
npx playwright test --reporter=line
```

Collect traces for debugging (open them with `npx playwright show-trace`):

```bash
npx playwright test --trace on
```

### Test Reports

Open the HTML test report after executing the tests:

```bash
npx playwright show-report
```

Playwright also provides diagnostic tools, including screenshots, traces, and execution logs.

## Continuous Integration

The repository includes a GitHub Actions workflow for code checks. It installs project dependencies and runs linting, TypeScript type checking, and Prettier formatting checks.

Playwright browser tests run locally against the public Toolshop instance. They are not part of the CI workflow because the public site can show a Cloudflare security challenge to GitHub-hosted runners.

## Test Environment

The project primarily targets the publicly hosted Toolshop application.

As this is a shared external test environment, test execution may be affected by application availability, network conditions, or changes to shared data.

Tests should minimize dependencies on shared state and avoid destructive operations against persistent data.

The product catalog is seeded and read-only for the tests. Expectations are derived from the live data instead of hardcoding product lists, and negative authentication scenarios use synthetic accounts — the seeded demo accounts are never modified.

## AI-Assisted Development

AI-assisted development tools may be used to support test design, implementation, refactoring, debugging, and technical reviews.

AI-generated changes are subject to review and verification. The goal is to use AI as an engineering tool while maintaining control over code quality, architecture, and testing decisions.

Repository-specific agent instructions are maintained in `AGENTS.md`.

## Project Goals

This portfolio is intended to demonstrate practical QA Automation engineering skills through realistic test scenarios and maintainable code.

The focus is on **test quality, reliability, clear architecture, and effective automation practices**, rather than maximizing the number of tests or dependencies.

---

**Disclaimer:** This is an independent QA Automation portfolio project. The Toolshop application is maintained by its respective creators and is used here exclusively as a system under test.
