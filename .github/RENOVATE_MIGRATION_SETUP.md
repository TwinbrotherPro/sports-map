# Renovate Auto-Migration Setup Guide

This guide explains how to set up the automated Renovate migration workflow that uses Claude Code to fix breaking changes.

## Overview

The workflow automatically:
1. Detects build/test errors when Renovate updates dependencies
2. Uses Claude Code AI to analyze and fix breaking changes
3. Commits fixes directly to the Renovate branch
4. Verifies that builds pass after fixes

## Prerequisites

- GitHub repository with Renovate bot enabled
- Node.js 22 (as specified in package.json)
- npm package manager

## Setup Instructions

### 1. Install Claude GitHub App

The Claude GitHub App is required for the workflow to create commits that trigger CI workflows.

**Option A: Automated Installation (Recommended)**
```bash
claude /install-github-app
```

**Option B: Manual Installation**
1. Visit [https://github.com/apps/claude](https://github.com/apps/claude)
2. Click "Install"
3. Select your repository (`sports-map`)
4. Grant the following permissions:
   - **Contents**: Read & write
   - **Pull requests**: Read & write
   - **Issues**: Read & write

### 2. Add Required Secrets

Go to your repository **Settings** → **Secrets and variables** → **Actions** and add the following secrets:

#### A. Anthropic API Key (Required)
1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. Click **New repository secret**
3. Add secret:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your Claude API key

#### B. Functions Credentials (Required for Functions Build)
Your `functions/src/credentials.ts` file is in `.gitignore` (correctly, to protect secrets), but the workflow needs it to build functions.

1. Copy the entire contents of your local `functions/src/credentials.ts` file
2. Click **New repository secret**
3. Add secret:
   - **Name**: `FUNCTIONS_CREDENTIALS`
   - **Value**: Paste the entire file contents

**Example `credentials.ts` format:**
```typescript
export const stravaClientSecret = "your-secret-here";
export const firebaseServiceAccount = { /* ... */ };
```

**Important:** The workflow will create this file dynamically during builds, so it never gets committed to git.

### 3. Verify Workflow Files

Ensure the following files exist in your repository:

- ✅ `.github/workflows/renovate-migration.yml` - Main workflow
- ✅ `.github/scripts/capture-errors.sh` - Error detection script
- ✅ `.github/scripts/generate-claude-prompt.sh` - Prompt generation script

These files are already created and ready to use.

## Usage

### Triggering the Workflow

1. Wait for Renovate to create a PR for a dependency update
2. **Add the `migrate-auto` label** to the PR
3. The workflow will automatically:
   - Build frontend and functions
   - Detect any errors
   - Ask Claude Code to fix the errors
   - Commit fixes to the branch
   - Verify builds pass

### Manual Trigger

If you need to re-run the workflow:
1. Remove the `migrate-auto` label
2. Add it back again
3. Or push a new commit to the `renovate/*` branch

## What Happens During Migration

### Step 1: Condition Check
- Verifies branch name starts with `renovate/`
- Confirms PR has `migrate-auto` label
- Exits early if conditions aren't met

### Step 2: Build & Error Detection
- Installs dependencies for frontend and functions
- Runs `npm run build` (frontend)
- Runs `npm test` (frontend)
- Runs `npm run build` (functions)
- Captures all error logs

### Step 3: Claude Code Fixes (if errors detected)
- Sends error logs to Claude Code
- Claude analyzes errors and breaking changes
- Applies code fixes automatically
- Runs builds to verify fixes work
- Commits changes with AI attribution

### Step 4: Final Verification
- Re-runs builds to confirm success
- Comments on PR with results
- Indicates if manual intervention is needed

## Expected Outcomes

### ✅ Success
- All builds pass after Claude's fixes
- PR comment indicates successful migration
- Code is ready for review and merge

### ⚠️ Partial Success
- Some builds still fail after fixes
- PR comment shows which builds failed
- Manual intervention required

### ❌ No Errors Detected
- Builds passed without any fixes needed
- PR comment confirms compatibility
- No code changes made

## Monitoring

### View Workflow Runs
1. Go to **Actions** tab in your repository
2. Look for "Renovate Migration Automation" workflows
3. Click on a run to see detailed logs

### Check PR Comments
The workflow automatically comments on PRs with:
- Build status before fixes
- Claude's analysis and fixes
- Final build verification results

## Troubleshooting

### Workflow Doesn't Trigger
- ✅ Verify branch name starts with `renovate/`
- ✅ Confirm `migrate-auto` label is applied
- ✅ Check that Claude GitHub App is installed
- ✅ Verify `ANTHROPIC_API_KEY` secret exists

### Claude Code Fails
- Check API key is valid
- Verify API quota hasn't been exceeded
- Review error logs in workflow run
- Check Claude Code documentation

### Builds Still Fail After Fixes
- Review Claude's attempted fixes in commit history
- Check error logs in workflow artifacts
- May require manual code changes
- Consider package-specific migration guides

## Cost Considerations

### GitHub Actions Minutes
- Free tier: 2,000 minutes/month for private repos
- Public repos: Unlimited
- This workflow typically uses 5-10 minutes per run

### Claude API Tokens
- Charged based on input/output tokens
- Typical cost per migration: $0.10-$0.50
- Uses Claude Sonnet 4.5 (cost-effective)
- Limited to 10 turns max to control costs

## Advanced Configuration

### Adjust Claude Model
Edit [.github/workflows/renovate-migration.yml:157](.github/workflows/renovate-migration.yml#L157):
```yaml
claude_args: '--max-turns 10 --model claude-opus-4-5-20251101'  # Use Opus for complex migrations
```

### Change Max Turns
Reduce iterations to save costs:
```yaml
claude_args: '--max-turns 5 --model claude-sonnet-4-5-20250929'
```

### Skip Specific Packages
Add to [renovate.json](../renovate.json):
```json
{
  "packageRules": [
    {
      "matchPackageNames": ["react"],
      "addLabels": ["skip-auto-fix"]  # Use different label
    }
  ]
}
```

## Support

For issues with:
- **Claude Code**: Visit [code.claude.com/docs](https://code.claude.com/docs)
- **GitHub Actions**: Check workflow logs and GitHub docs
- **Renovate**: Review Renovate bot documentation

## Next Steps

1. ✅ Complete setup steps above
2. Wait for a Renovate PR (or create a test PR)
3. Add `migrate-auto` label
4. Monitor the workflow execution
5. Review and merge if successful

The workflow is now ready to automatically migrate breaking changes in your Renovate PRs!
