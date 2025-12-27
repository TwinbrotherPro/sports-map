#!/bin/bash

# Extract package info from PR title or branch name
PACKAGE_INFO=$(gh pr view --json title -q .title)

# Build comprehensive prompt
cat << EOF
This is a Renovate PR: $PACKAGE_INFO

Build and test errors have occurred. Please fix the breaking changes to make the code compatible with the new package version.

=== FRONTEND ERRORS (npm run build + test) ===
$(cat build-errors.log test-errors.log 2>/dev/null || echo "No frontend errors")

=== FUNCTIONS ERRORS (npm run build) ===
$(cat functions-errors.log 2>/dev/null || echo "No functions errors")

=== PROJECT STACK ===
Frontend: React 18.3.1, TypeScript 5.8.3 (strict: false), React Query v4.36.1, Material-UI v5.14.14
Backend: Express v5.1.0, Firebase Functions v6.1.1, Axios v1.12.0
Package Manager: npm (both frontend and functions)

=== INSTRUCTIONS ===
1. Analyze the error logs above
2. Identify the breaking changes in the updated package
3. Fix the code to work with the new version
4. Run "npm run build" (frontend) and "cd functions && npm run build" (backend) to verify fixes
5. If builds succeed, commit the changes

Focus on:
- Import path changes
- API signature updates
- Type compatibility issues
- Deprecated method replacements
EOF
