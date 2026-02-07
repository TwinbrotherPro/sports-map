# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sports Map is a React-based web application that visualizes Strava activities on an interactive map. It integrates with the Strava API to fetch user activities and displays them using Leaflet/React Leaflet on OpenStreetMap tiles.

**This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.**

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git commit` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **COMMIT TO LOCAL BRANCH** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git commit <Your Commit message>
   git status  # MUST show your current commit in the local git tree
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git commit` succeeds
- NEVER stop before committing - that leaves work stranded locally
- NEVER say "ready to commit when you are" - YOU must commit
- If commit fails, resolve and retry until it succeeds

**Live deployment:** https://sportsmap.philippkraus.me

**Tech stack:**

- Frontend: React 18 with TypeScript, Material-UI, React Query (@tanstack/react-query)
- Maps: React Leaflet, Leaflet, leaflet-color-markers
- Backend: Firebase (Hosting + Cloud Functions)
- Data: Strava API integration with OAuth2 authentication

## Development Commands

### Frontend (root directory)

```bash
npm start           # Run development server on http://localhost:3000
npm test            # Run tests in watch mode
npm run build       # Build production bundle
npm run deploy      # Deploy to Firebase hosting (runs build first)
```

### Firebase Functions (functions/ directory)

```bash
npm run build       # Compile TypeScript to lib/
npm run serve       # Build and start Firebase emulator
npm run deploy      # Deploy functions to Firebase
npm run logs        # View function logs
```

## Architecture

### PWA Configuration

The app is configured as a Progressive Web App with `"display": "minimal-ui"` in the manifest.json. This display mode was chosen over `"standalone"` to ensure OAuth redirects work correctly within the PWA context on mobile devices. The minimal-ui mode shows a minimal browser UI (address bar) which prevents external OAuth redirects from opening in a separate in-app browser window, maintaining the authentication flow integrity.

### Authentication Flow

1. User clicks "Connect with Strava" button, redirected to Strava OAuth
2. Strava redirects back with `code` query parameter
3. `useAuthAthlete` hook extracts code, calls Firebase proxy function
4. Proxy function (`stravaproxy`) exchanges code for access token via Firebase Functions
5. `tokenExchangeSecondGen` function validates token with Strava API, creates/retrieves Firebase user
6. Access token stored in React Query cache for subsequent API calls

### Data Fetching with React Query

- **useAuthAthlete** (hooks/useAuthAthlete.ts): Handles OAuth code exchange, returns `accessToken` and `athlete`
- **useActivities** (hooks/useActivities.ts): Infinite query that fetches Strava activities in paginated batches (100 per page)
- All queries use `refetchOnMount: false`, `refetchOnWindowFocus: false` to preserve cached data
- Activities are flattened from paginated response into single array

### Component Structure

- **App.tsx**: Root component with routing, Material-UI theme, bottom navigation
- **AddActivityButton.tsx**: Landing page, orchestrates authentication and renders Dashboard when ready
- **Dashboard.tsx**: Main map view, manages activity state (selection, heat map, markers)
  - **ActivityMaker**: Individual activity renderer (polyline + marker)
  - Decodes polylines using `polyline-encoded` library
  - Handles activity selection and map zoom interactions
- **components/Control.tsx**: Map control panel with zoom, markers toggle, heat map toggle, pagination
- **components/ActivityOverlay.tsx**: Display details of selected activity
- **components/Profile.tsx**: User profile display on map
- **components/LocationCircle.tsx**: User's current location indicator

### Firebase Functions (functions/src/index.ts)

- **stravaproxy**: Express app that proxies OAuth token exchange to Strava, replacing client secret
  - Separate `/oauth` (prod) and `/dev/oauth` (dev) endpoints
- **tokenExchangeSecondGen**: Second-gen HTTPS function (CORS enabled)
  - Validates Strava token by calling `/athlete` endpoint
  - Creates Firebase user if new, generates custom auth token
  - Stores user in Firestore (`users` collection indexed by `stravaId`)
- **stravaWebhook**: Webhook endpoint for Strava activity updates (currently logs only)

### Configuration (config/config.ts)

Environment-aware config returns different Strava OAuth URLs and client IDs for dev vs production:

- Dev: client_id=59296, redirects to localhost:3000
- Prod: client_id=58846, redirects to sportsmap.philippkraus.me

### Key Patterns

- **Lazy loading**: `AddActivityButton` is lazy-loaded in App.tsx
- **Polyline decoding**: Use `polyline-encoded` library, not `@mapbox/polyline` (both installed)
- **Map bounds**: Calculated from all activity start positions, used for initial map view and "zoom out"
- **Activity selection**: Tracked by ID in Dashboard state, changes polyline color to red and increases weight
- **Heat map mode**: Reduces opacity of non-selected activities (0.4) while keeping selected activity at full opacity
- **Pagination**: Infinite scroll pattern with "Next Page" button, fetches when `hasNextPage` is true

## Testing

Tests use React Testing Library and Jest (configured via `react-scripts`). Run individual tests:

```bash
npm test -- --testPathPattern=YourTest
```

## Automated Dependency Migration

This repository uses a GitHub Actions workflow (`.github/workflows/renovate-migration.yml`) to automatically migrate breaking changes in Renovate PRs:

- **Trigger**: Add the `migrate-auto` label to any Renovate PR on a `renovate/*` branch
- **Process**: Claude Code analyzes build/test errors and applies fixes automatically
- **Verification**: Builds and tests run after fixes to ensure they work
- **Commits**: Changes are committed directly to the Renovate branch with AI attribution

### Migration Guidance for Claude

When fixing dependency migration issues:

1. **Import paths**: Check for changes in package export structure (e.g., React Query v4 → v5)
2. **API signatures**: Look for breaking changes in method parameters or return types
3. **Type compatibility**: TypeScript strict mode is disabled (`strict: false`), but types must still be compatible
4. **Deprecated methods**: Replace with recommended alternatives from changelog/migration guides
5. **Build verification**: Always run `npm run build` (frontend) and `cd functions && npm run build` (backend) before committing

### Common Migration Patterns

- **React Query**: Uses v4 patterns (e.g., `useInfiniteQuery` with `getNextPageParam`)
- **Material-UI**: v5 with Emotion styling
- **Express**: v5 with modern middleware patterns
- **Firebase Functions**: v6 with second-gen HTTPS functions

## Important Notes

- **Node version**: Requires Node 22 (specified in both root and functions package.json)
- **Package manager**: npm for both frontend and functions
- **Firebase deployment**: `firebase deploy --only hosting` runs build automatically via `predeploy` hook
- **Functions build**: TypeScript functions must be compiled before deployment (automatic via predeploy hook)
- **Strava rate limits**: Be mindful of Strava API quotas during development
- **Client secrets**: Never commit credentials.ts (functions/src/credentials.ts) - contains Strava client secrets
