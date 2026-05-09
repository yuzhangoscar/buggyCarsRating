.PHONY: install test test-headed test-debug lint lint-fix report report-open clean help \
        docker-build docker-test docker-lint docker-report

# Default environment
TEST_ENV ?= dev
DOCKER_IMAGE ?= buggycarsrating-tests

## Install dependencies
install:
	npm ci
	npx playwright install --with-deps chromium

## Run all tests (headless)
test:
	TEST_ENV=$(TEST_ENV) npx playwright test

## Run tests with browser visible
test-headed:
	TEST_ENV=$(TEST_ENV) npx playwright test --headed

## Run tests in debug mode
test-debug:
	TEST_ENV=$(TEST_ENV) npx playwright test --debug

## Run tests for a specific file (usage: make test-file FILE=tests/example.spec.ts)
test-file:
	TEST_ENV=$(TEST_ENV) npx playwright test $(FILE)

## Run lint
lint:
	npx eslint .

## Run lint with auto-fix
lint-fix:
	npx eslint . --fix

## Generate Allure report
report:
	npx allure generate allure-results --clean -o allure-report

## Open Allure report in browser
report-open: report
	npx allure open allure-report

## Clean test artifacts
clean:
	rm -rf allure-results allure-report test-results playwright-report

## Build Docker image
docker-build:
	docker build -t $(DOCKER_IMAGE) .

## Run tests in Docker
docker-test: docker-build
	docker run --rm \
		-e TEST_ENV=$(TEST_ENV) \
		-v $(PWD)/allure-results:/app/allure-results \
		-v $(PWD)/test-results:/app/test-results \
		$(DOCKER_IMAGE)

## Run lint in Docker
docker-lint: docker-build
	docker run --rm $(DOCKER_IMAGE) npx eslint .

## Generate Allure report in Docker
docker-report: docker-build
	docker run --rm \
		-v $(PWD)/allure-results:/app/allure-results \
		-v $(PWD)/allure-report:/app/allure-report \
		$(DOCKER_IMAGE) npx allure generate allure-results --clean -o allure-report

## Show help
help:
	@echo "Available targets:"
	@echo "  make install       - Install dependencies and browsers"
	@echo "  make test          - Run all tests (headless)"
	@echo "  make test-headed   - Run tests with browser visible"
	@echo "  make test-debug    - Run tests in debug mode"
	@echo "  make test-file FILE=<path>  - Run a specific test file"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Run ESLint with auto-fix"
	@echo "  make report        - Generate Allure report"
	@echo "  make report-open   - Generate and open Allure report"
	@echo "  make clean         - Clean test artifacts"
	@echo ""
	@echo "Docker targets:"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-test   - Run tests in Docker"
	@echo "  make docker-lint   - Run lint in Docker"
	@echo "  make docker-report - Generate Allure report in Docker"
	@echo ""
	@echo "Environment: TEST_ENV=$(TEST_ENV) (options: dev, staging, qa)"
	@echo "  Example: make test TEST_ENV=staging"
	@echo "  Example: make docker-test TEST_ENV=qa"
