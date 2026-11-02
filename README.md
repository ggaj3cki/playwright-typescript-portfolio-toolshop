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

Browser-based functional testing of the application, including authentication, product browsing, searching, filtering, shopping cart operations, and form validation.

### API Testing

REST API testing covering response validation, HTTP status codes, authentication, negative scenarios, and resource operations.

### End-to-End Testing

Business workflows combining multiple application features, including product selection, shopping cart operations, and checkout.

The project also explores integration between UI and API testing, such as API-assisted test setup and verification.

## Test Architecture & Practices

The project emphasizes:

- Page Object Model (POM) where appropriate
- Reusable fixtures and helper functions
- Data-driven and parameterized testing
- Test isolation and independent execution
- Reliable locators and web-first assertions
- Meaningful test steps and assertions
- Positive and negative test scenarios
- Network interception and response validation
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

### Test Reports

Open the HTML test report after executing the tests:

```bash
npx playwright show-report
```

Playwright also provides diagnostic tools, including screenshots, traces, and execution logs.

## Continuous Integration

The repository includes a GitHub Actions workflow for automated test execution.

The CI workflow installs project dependencies, prepares Playwright browsers, runs the test suite, and makes test reports available as workflow artifacts.

This helps verify that tests can execute outside the local development environment.

## Test Environment

The project primarily targets the publicly hosted Toolshop application.

As this is a shared external test environment, test execution may be affected by application availability, network conditions, or changes to shared data.

Tests should minimize dependencies on shared state and avoid destructive operations against persistent data.

## AI-Assisted Development

AI-assisted development tools may be used to support test design, implementation, refactoring, debugging, and technical reviews.

AI-generated changes are subject to review and verification. The goal is to use AI as an engineering tool while maintaining control over code quality, architecture, and testing decisions.

Repository-specific agent instructions are maintained in `AGENTS.md`.

## Project Goals

This portfolio is intended to demonstrate practical QA Automation engineering skills through realistic test scenarios and maintainable code.

The focus is on **test quality, reliability, clear architecture, and effective automation practices**, rather than maximizing the number of tests or dependencies.

---

**Disclaimer:** This is an independent QA Automation portfolio project. The Toolshop application is maintained by its respective creators and is used here exclusively as a system under test.