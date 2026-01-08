# Railway Build Configuration Fix

## Issue Found

Railway is **ignoring `nixpacks.toml`** and auto-detecting the monorepo structure, causing it to:

- Build ALL packages (`yarn build:code`)
- Run complex build steps we don't need
- Ignore our simplified configuration

## Root Cause

1. **Railway auto-detection**: Railway detects `workspaces` in `package.json` and generates its own build
2. **Railpack vs Nixpacks**: Railway may be using Railpack (newer builder) which behaves differently
3. **Priority**: Railway's auto-detection may override `nixpacks.toml`

## Solution Applied

### 1. Added `buildCommand` to `railway.json`

This explicitly tells Railway what build command to use:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "yarn install --frozen-lockfile && cd examples/getstarted && yarn build"
  }
}
```

**Why this works:**

- `buildCommand` in `railway.json` takes precedence over auto-detection
- Installs from root to resolve `workspace:*` dependencies
- Only builds the app, not all packages

### 2. Updated `nixpacks.toml` to match

```toml
[phases.install]
cmds = [
  "yarn install --frozen-lockfile",
  "cd examples/getstarted && yarn build"
]
```

## Important Notes

- **Workspace dependencies**: The app still uses `workspace:*` dependencies, so we need to install from root first
- **Packages directory**: Must be included (not in `.railwayignore`) for workspace resolution
- **No package building**: We're NOT building packages, just installing them for workspace resolution

## Expected Build Process

1. `yarn install --frozen-lockfile` (from root) - Resolves workspace dependencies
2. `cd examples/getstarted && yarn build` - Builds only the app
3. `cd examples/getstarted && yarn start` - Starts the app

## Testing

After deploying, check build logs to verify:

- ✅ Only runs our simplified build command
- ✅ Doesn't run `yarn build:code` (monorepo build)
- ✅ Successfully builds the app
