FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (skip husky in CI)
RUN npm ci --ignore-scripts

# Copy the rest of the project
COPY . .

# Default environment
ENV TEST_ENV=dev

# Run tests by default
CMD ["npx", "playwright", "test"]
