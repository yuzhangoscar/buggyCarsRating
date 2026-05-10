# Buggy Cars Rating - E2E Tests

[![Playwright Tests](https://github.com/yuzhangoscar/buggyCarsRating/actions/workflows/playwright.yml/badge.svg)](https://github.com/yuzhangoscar/buggyCarsRating/actions/workflows/playwright.yml)
[![Allure Report](https://img.shields.io/badge/Allure_Report-online-green?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PC9zdmc+)](https://yuzhangoscar.github.io/buggyCarsRating/)

![Playwright](https://img.shields.io/badge/Playwright-v1.59.1-45ba4b?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-v6.0.3-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Cucumber](https://img.shields.io/badge/Cucumber_BDD-v12.8.3-23D96C?logo=cucumber&logoColor=white)
![playwright-bdd](https://img.shields.io/badge/playwright--bdd-v8.5.0-45ba4b)
![Allure](https://img.shields.io/badge/Allure_Report-v2.40.0-FF6B00)
![ESLint](https://img.shields.io/badge/ESLint-v9.39.4-4B32C3?logo=eslint&logoColor=white)
![Husky](https://img.shields.io/badge/Husky-v9.1.7-000000?logo=git&logoColor=white)
![Commitlint](https://img.shields.io/badge/Commitlint-v20.5.3-000000)
![Docker](https://img.shields.io/badge/Docker-supported-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)

Playwright end-to-end tests for Buggy Cars Rating, written in TypeScript with Cucumber BDD.

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
