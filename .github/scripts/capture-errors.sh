#!/bin/bash
set +e  # Don't exit on errors

# Initialize error flags
HAS_ERRORS=false

# Frontend dependency installation
echo "Installing frontend dependencies..."
npm ci 2>&1 | tee install-errors.log
INSTALL_EXIT=${PIPESTATUS[0]}
if [ $INSTALL_EXIT -ne 0 ]; then
  echo "ERROR: Frontend dependency installation failed (exit code: $INSTALL_EXIT)"
  HAS_ERRORS=true
fi

# Functions dependency installation
echo "Installing functions dependencies..."
cd functions
npm ci 2>&1 | tee ../functions-install-errors.log
FUNCTIONS_INSTALL_EXIT=${PIPESTATUS[0]}
cd ..
if [ $FUNCTIONS_INSTALL_EXIT -ne 0 ]; then
  echo "ERROR: Functions dependency installation failed (exit code: $FUNCTIONS_INSTALL_EXIT)"
  HAS_ERRORS=true
fi

# Only run builds if installations succeeded
if [ $INSTALL_EXIT -eq 0 ]; then
  # Frontend build
  echo "Building frontend..."
  npm run build 2>&1 | tee build-errors.log
  FRONTEND_EXIT=${PIPESTATUS[0]}
  if [ $FRONTEND_EXIT -ne 0 ]; then
    echo "ERROR: Frontend build failed (exit code: $FRONTEND_EXIT)"
    HAS_ERRORS=true
  fi

  # Frontend tests
  echo "Running frontend tests..."
  npm test -- --watchAll=false 2>&1 | tee test-errors.log
  TEST_EXIT=${PIPESTATUS[0]}
  if [ $TEST_EXIT -ne 0 ]; then
    echo "ERROR: Frontend tests failed (exit code: $TEST_EXIT)"
    HAS_ERRORS=true
  fi
else
  echo "Skipping frontend build and tests due to installation failure"
  echo "Installation failed - skipping build" > build-errors.log
  echo "Installation failed - skipping tests" > test-errors.log
fi

if [ $FUNCTIONS_INSTALL_EXIT -eq 0 ]; then
  # Functions build
  echo "Building functions..."
  cd functions && npm run build 2>&1 | tee ../functions-errors.log
  FUNCTIONS_EXIT=${PIPESTATUS[0]}
  cd ..
  if [ $FUNCTIONS_EXIT -ne 0 ]; then
    echo "ERROR: Functions build failed (exit code: $FUNCTIONS_EXIT)"
    HAS_ERRORS=true
  fi
else
  echo "Skipping functions build due to installation failure"
  echo "Installation failed - skipping build" > functions-errors.log
fi

# Check if any errors occurred
if [ "$HAS_ERRORS" = true ]; then
  echo "has_errors=true" >> $GITHUB_OUTPUT
  exit 1
else
  echo "has_errors=false" >> $GITHUB_OUTPUT
  exit 0
fi
