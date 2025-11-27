# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sports Map is a React-based web application that visualizes Strava activities on an interactive map. It integrates with the Strava API to fetch user activities and displays them using Leaflet/React Leaflet on OpenStreetMap tiles.

**Live deployment:** https://sportsmap.philippkraus.me

**Tech stack:**
- Frontend: React 18 with TypeScript, Material-UI, React Query (@tanstack/react-query)
- Maps: React Leaflet, Leaflet, leaflet-color-markers
- Backend: Firebase (Hosting + Cloud Functions)
- Data: Strava API integration with OAuth2 authentication

## Development Commands

### Frontend (root directory)
```bash
yarn start          # Run development server on http://localhost:3000
yarn test           # Run tests in watch mode
yarn build          # Build production bundle
yarn deploy         # Deploy to Firebase hosting (runs build first)
```

### Firebase Functions (functions/ directory)
```bash
npm run build       # Compile TypeScript to lib/
npm run serve       # Build and start Firebase emulator
npm run deploy      # Deploy functions to Firebase
npm run logs        # View function logs
```

## Architecture

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
yarn test --testPathPattern=YourTest
```

## Important Notes

- **Node version**: Requires Node 22 (specified in both root and functions package.json)
- **Firebase deployment**: `firebase deploy --only hosting` runs build automatically via `predeploy` hook
- **Functions build**: TypeScript functions must be compiled before deployment (automatic via predeploy hook)
- **Strava rate limits**: Be mindful of Strava API quotas during development
- **Client secrets**: Never commit credentials.ts (functions/src/credentials.ts) - contains Strava client secrets
