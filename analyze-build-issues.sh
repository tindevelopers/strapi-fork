#!/bin/bash

echo "🔍 Analyzing Railway Build Configuration"
echo "========================================="
echo ""

# Check build configuration files
echo "1. Checking build configuration files..."
echo ""

if [ -f "nixpacks.toml" ]; then
    echo "✅ nixpacks.toml found:"
    cat nixpacks.toml
    echo ""
else
    echo "⚠️  nixpacks.toml not found"
    echo ""
fi

if [ -f "railway.json" ]; then
    echo "✅ railway.json found:"
    cat railway.json
    echo ""
else
    echo "⚠️  railway.json not found"
    echo ""
fi

# Check for potential issues
echo "2. Analyzing potential build issues..."
echo ""

# Check if both nixpacks.toml and railway.json have build commands
if [ -f "nixpacks.toml" ] && [ -f "railway.json" ]; then
    echo "⚠️  POTENTIAL CONFLICT: Both nixpacks.toml and railway.json exist"
    echo "   Railway may use nixpacks.toml if present, ignoring railway.json buildCommand"
    echo "   Recommendation: Use only one build configuration"
    echo ""
fi

# Check build command consistency
if [ -f "nixpacks.toml" ]; then
    NIXPACKS_BUILD=$(grep -A 5 "\[phases.install\]" nixpacks.toml | grep "cmds" -A 3 | grep -v "cmds\|^--" | tr -d '",' | xargs)
    echo "nixpacks.toml build commands: $NIXPACKS_BUILD"
fi

if [ -f "railway.json" ]; then
    RAILWAY_BUILD=$(grep "buildCommand" railway.json | sed 's/.*"buildCommand": "\(.*\)".*/\1/')
    echo "railway.json build command: $RAILWAY_BUILD"
fi

echo ""
echo "3. Common build failure causes:"
echo ""
echo "❌ Workspace dependencies not resolved:"
echo "   - Ensure 'yarn build' runs before 'cd examples/getstarted && yarn build'"
echo "   - Workspace packages must be built first"
echo ""
echo "❌ Build timeout:"
echo "   - Railway has build time limits"
echo "   - Large monorepos may exceed limits"
echo ""
echo "❌ Missing dependencies:"
echo "   - Check if all workspace packages are included"
echo "   - Verify .railwayignore doesn't exclude necessary files"
echo ""
echo "4. Recommended fixes:"
echo ""
echo "Option A: Use nixpacks.toml only (recommended)"
echo "   - Remove buildCommand from railway.json"
echo "   - Ensure nixpacks.toml has correct build phases"
echo ""
echo "Option B: Use railway.json only"
echo "   - Remove or rename nixpacks.toml"
echo "   - Use railway.json buildCommand"
echo ""
echo "5. To view actual build logs:"
echo "   - Visit Railway dashboard: https://railway.app"
echo "   - Navigate to your project → Deployments → Latest deployment"
echo "   - Check 'Build Logs' tab"
echo ""

