# Buggy Cars Rating - E2E Tests

Playwright end-to-end tests for Buggy Cars Rating, written in TypeScript.

## Prerequisites

- Node.js 22+
- npm

## Setup

```sh
make install
```

## Running Tests

```sh
# Run all tests (default: dev environment)
make test

# Run against a specific environment
make test TEST_ENV=staging

# Run with browser visible
make test-headed

# Run in debug mode
make test-debug

# Run a specific test file
make test-file FILE=tests/example.spec.ts
```

## Linting

```sh
make lint
make lint-fix
```

## Allure Reports

```sh
# Generate report
make report

# Generate and open in browser
make report-open
```

## Environments

Set `TEST_ENV` to one of: `dev`, `staging`, `qa`. Default is `dev`.

## Git Conventions

- **Branch names**: `feature/*`, `bugfix/*`, `hotfix/*`, `release/*`, `test/*`, `chore/*`, `main`, `master`, `develop`
- **Commit messages**: [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat: add login test`, `fix: update selector`)

## CI/CD

GitHub Actions runs tests:
- **Nightly** at midnight UTC
- **Manually** via workflow dispatch with environment selection (dev/staging/qa)

Test results and Allure reports are uploaded as artifacts.
