#!/bin/bash

# Extract package info from PR title or branch name
PACKAGE_INFO=$(gh pr view --json title -q .title)

# Build comprehensive prompt
cat << EOF
This is a Renovate PR: $PACKAGE_INFO

Build errors have occurred. Please fix the breaking changes to make the code compatible with the new package version.

=== INSTALLATION ERRORS ===
Frontend install (npm ci):
$(cat install-errors.log 2>/dev/null || echo "No frontend installation errors")

Functions install (cd functions && npm ci):
$(cat functions-install-errors.log 2>/dev/null || echo "No functions installation errors")

=== BUILD ERRORS ===
Frontend build (npm run build):
$(cat build-errors.log 2>/dev/null || echo "No frontend build errors")

Functions build (cd functions && npm run build):
$(cat functions-errors.log 2>/dev/null || echo "No functions build errors")

=== PROJECT STACK ===
Frontend: React 18.3.1, TypeScript 5.8.3 (strict: false), React Query v4.36.1, Material-UI v5.14.14
Backend: Express v5.1.0, Firebase Functions v6.1.1, Axios v1.12.0
Package Manager: npm (both frontend and functions)

=== INSTRUCTIONS ===
1. Analyze the error logs above
2. Identify the breaking changes in the updated package
3. Fix the code to work with the new version
4. Run "npm run build" (frontend) and "cd functions && npm run build" (backend) to verify fixes

Focus on:
- Import path changes
- API signature updates
- Type compatibility issues
- Deprecated method replacements
- Linting errors can be ignored
EOF
