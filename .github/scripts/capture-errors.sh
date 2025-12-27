#!/bin/bash
set +e  # Don't exit on errors

# Frontend build
echo "Building frontend..."
npm run build 2>&1 | tee build-errors.log
FRONTEND_EXIT=$?

# Frontend tests
echo "Running frontend tests..."
npm test -- --watchAll=false 2>&1 | tee test-errors.log
TEST_EXIT=$?

# Functions build
echo "Building functions..."
cd functions && npm run build 2>&1 | tee ../functions-errors.log
FUNCTIONS_EXIT=$?
cd ..

# Check if any errors occurred
if [ $FRONTEND_EXIT -ne 0 ] || [ $TEST_EXIT -ne 0 ] || [ $FUNCTIONS_EXIT -ne 0 ]; then
  echo "has_errors=true" >> $GITHUB_OUTPUT
  exit 1
else
  echo "has_errors=false" >> $GITHUB_OUTPUT
  exit 0
fi
