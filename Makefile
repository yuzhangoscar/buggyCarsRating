.PHONY: install bddgen test test-headed test-debug lint lint-fix report report-open clean help \
        docker-build docker-test docker-lint docker-report

# Default environment
TEST_ENV ?= dev
DOCKER_IMAGE ?= buggycarsrating-tests

## Install dependencies
install:
	npm ci
	npx playwright install --with-deps chromium

## Generate BDD test files from .feature files
bddgen:
	./node_modules/.bin/bddgen

## Run all BDD tests (headless)
test: bddgen
	TEST_ENV=$(TEST_ENV) npx playwright test --project=bdd

## Run BDD tests with browser visible
test-headed: bddgen
	TEST_ENV=$(TEST_ENV) npx playwright test --project=bdd --headed

## Run BDD tests in debug mode
test-debug: bddgen
	TEST_ENV=$(TEST_ENV) npx playwright test --project=bdd --debug

## Run a specific feature file (usage: make test-file FILE=tests/features/home.feature)
test-file: bddgen
	TEST_ENV=$(TEST_ENV) npx playwright test --project=bdd $(FILE)

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
	rm -rf allure-results allure-report test-results playwright-report .features-gen

## Build Docker image
docker-build:
	docker build -t $(DOCKER_IMAGE) .

## Run BDD tests in Docker
docker-test: docker-build
	docker run --rm \
		-e TEST_ENV=$(TEST_ENV) \
		-e BUGGY_CARS_LOGIN_PASSWORD \
		-e BUGGY_CARS_TEST_LOGIN \
		-v $(PWD)/allure-results:/app/allure-results \
		-v $(PWD)/test-results:/app/test-results \
		$(DOCKER_IMAGE) sh -c "./node_modules/.bin/bddgen && npx playwright test --project=bdd"

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
	@echo "  make bddgen        - Generate BDD tests from .feature files"
	@echo "  make test          - Run all BDD tests (headless)"
	@echo "  make test-headed   - Run BDD tests with browser visible"
	@echo "  make test-debug    - Run BDD tests in debug mode"
	@echo "  make test-file FILE=<path>  - Run a specific feature file"
	@echo "  make lint          - Run ESLint"
	@echo "  make lint-fix      - Run ESLint with auto-fix"
	@echo "  make report        - Generate Allure report"
	@echo "  make report-open   - Generate and open Allure report"
	@echo "  make clean         - Clean test artifacts"
	@echo ""
	@echo "Docker targets:"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-test   - Run BDD tests in Docker"
	@echo "  make docker-lint   - Run lint in Docker"
	@echo "  make docker-report - Generate Allure report in Docker"
	@echo ""
	@echo "Environment: TEST_ENV=$(TEST_ENV) (options: dev, staging, qa)"
	@echo "  Example: make test TEST_ENV=staging"
	@echo "  Example: make docker-test TEST_ENV=qa"
