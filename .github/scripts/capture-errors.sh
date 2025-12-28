#!/bin/bash
set +e  # Don't exit on errors

# Initialize error flags
HAS_ERRORS=false

# Frontend dependency installation
echo "Installing frontend dependencies..."
INSTALL_OUTPUT=$(npm ci 2>&1)
INSTALL_EXIT=$?
if [ $INSTALL_EXIT -ne 0 ]; then
  echo "ERROR: Frontend dependency installation failed (exit code: $INSTALL_EXIT)"
  echo "$INSTALL_OUTPUT" > install-errors.log
  HAS_ERRORS=true
else
  echo "✓ Frontend dependencies installed successfully"
fi

# Functions dependency installation
echo "Installing functions dependencies..."
cd functions
FUNCTIONS_INSTALL_OUTPUT=$(npm ci 2>&1)
FUNCTIONS_INSTALL_EXIT=$?
cd ..
if [ $FUNCTIONS_INSTALL_EXIT -ne 0 ]; then
  echo "ERROR: Functions dependency installation failed (exit code: $FUNCTIONS_INSTALL_EXIT)"
  echo "$FUNCTIONS_INSTALL_OUTPUT" > functions-install-errors.log
  HAS_ERRORS=true
else
  echo "✓ Functions dependencies installed successfully"
fi

# Only run builds if installations succeeded
if [ $INSTALL_EXIT -eq 0 ]; then
  # Frontend build
  echo "Building frontend..."
  FRONTEND_OUTPUT=$(npm run build 2>&1)
  FRONTEND_EXIT=$?
  if [ $FRONTEND_EXIT -ne 0 ]; then
    echo "ERROR: Frontend build failed (exit code: $FRONTEND_EXIT)"
    echo "$FRONTEND_OUTPUT" > build-errors.log
    HAS_ERRORS=true
  else
    echo "✓ Frontend build successful"
  fi
else
  echo "Skipping frontend build due to installation failure"
  echo "Installation failed - skipping build" > build-errors.log
fi

if [ $FUNCTIONS_INSTALL_EXIT -eq 0 ]; then
  # Functions build
  echo "Building functions..."
  cd functions
  FUNCTIONS_OUTPUT=$(npm run build 2>&1)
  FUNCTIONS_EXIT=$?
  cd ..
  if [ $FUNCTIONS_EXIT -ne 0 ]; then
    echo "ERROR: Functions build failed (exit code: $FUNCTIONS_EXIT)"
    echo "$FUNCTIONS_OUTPUT" > functions-errors.log
    HAS_ERRORS=true
  else
    echo "✓ Functions build successful"
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
