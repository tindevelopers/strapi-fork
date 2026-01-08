# Use Node.js 20
FROM node:20-alpine

# Install yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /app

# Copy root package files first (needed for workspace resolution)
COPY package.json yarn.lock ./

# Copy packages directory (needed for workspace:* dependencies)
COPY packages ./packages

# Copy examples/plugins directory (needed for workspace-plugin dependency)
COPY examples/plugins ./examples/plugins

# Copy example app package.json files (needed for workspace resolution)
COPY examples/getstarted/package.json ./examples/getstarted/

# Install dependencies from root to resolve workspace dependencies
# Temporarily allowing lockfile updates to diagnose the issue
# TODO: Fix yarn.lock sync issue and restore --immutable flag
RUN yarn install

# Copy the app source code
COPY examples/getstarted ./examples/getstarted

# Build only the app (not all packages)
WORKDIR /app/examples/getstarted
RUN yarn build

# Start the app
CMD ["yarn", "start"]

