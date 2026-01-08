# Use Node.js 20
FROM node:20-alpine

# Install yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /app

# Copy root package files first (needed for workspace resolution)
COPY package.json yarn.lock ./

# Copy Nx configuration and build utilities (needed for building workspace packages)
COPY nx.json rollup.utils.mjs ./

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

# Build workspace packages (needed for strapi CLI and dependencies)
RUN yarn build:code

# Copy the app source code
COPY examples/getstarted ./examples/getstarted

# Build the app
WORKDIR /app/examples/getstarted
RUN yarn build

# Start the app
CMD ["yarn", "start"]

