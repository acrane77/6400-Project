# Event Planner

A web app for planning and promoting campus events, built for ECE 6400: Software Development Practices. Organizers create events, invite volunters, and track their advertisement campaigns. Participants browse a calendar of upcoming events, search, and sign up.

## Features

- **Accounts and roles:** Email/password sign-up and login with Firebase Auth. Each user has a role: `DEVELOPER`, `ORGANIZER`, `VOLUNTEER` or `PARTICIPANT`. The server checks the role before allowing restricted actions.
- **Events:** Create events with a title, description, date, location (at MUN or an address), and category. Events are only visible to the people who should see them.
- **Event calendar:** Browse upcoming events in a month or week view.
- **Search:** Filter events by keywords, category (including subcategories) and date range.
- **Sign-ups:** Participants sign up for events, and organizers see who is attending.
- **Invites:** Organizers generate invite links, each with a scannable QR code.
- **QR code generator:** A QR code encoder written from scratch (versions 1–5, error-correction level L, up to 108 characters).
- **QR poster tracking:** Each poster for an event gets its own QR code. Scanning it records the scan and opens the event's public page.
- **Poster analytics:** A dashboard of scans, sign-ups and conversion for each poster. *(It currently shows sample data.)*

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- Tailwind CSS v4 with shadcn-style UI components
- Firebase Auth and Cloud Firestore
- Firebase Local Emulator Suite for local development
- Node's built-in test runner for unit tests

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 24 or newer
- [Yarn](https://yarnpkg.com)
- Java 21 or newer

### Install

```bash
yarn install
```

### Run locally (with the Firebase emulators)

```bash
./run_demo.sh
```

This script sets the environment variables for the emulators, starts the Auth and Firestore emulators, and then starts the Next.js dev server.

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Emulator UI | http://localhost:4000 |
| Auth emulator | 127.0.0.1:9099 |
| Firestore emulator | 127.0.0.1:8081 |

The emulators don't keep data between runs, so create a new account each time you start the demo.

### Run against a real Firebase project

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Then run:

```bash
yarn dev        # development
yarn build && yarn start   # production
```

### Tests

```bash
node --require ./tests/register-typescript.cjs --test \
  core/tests/auth.test.cjs \
  features/Account/tests/accountRoutes.test.cjs \
  features/events/tests/usecases.test.cjs
```

The tests use a mocked Firebase Admin SDK (`tests/mocks/firebaseAdmin.cjs`), so they don't need the emulators.

### Lint

```bash
yarn lint
```

## Project Structure

Code is organized by feature. Each feature has `data` (models and repositories), `domain` (API clients and use cases), `presentation` (React components, contexts and client API calls) and `tests`.

```
├── app/                          # Next.js App Router: pages and API routes
│   ├── account/
│   │   ├── login/                # Login page
│   │   ├── signup/               # Sign-up page
│   │   ├── events/
│   │   │   ├── my-events/        # Your events, plus the create-event dialog
│   │   │   ├── create/           # Redirects to My Events
│   │   │   └── [id]/manage/      # Invites, members and posters for an event
│   │   └── analytics/            # Poster analytics dashboard
│   │       └── [posterId]/       # Analytics for one poster
│   ├── events/
│   │   ├── page.tsx              # Event calendar and search
│   │   ├── [id]/                 # Public event page (QR scans land here)
│   │   └── invite/
│   │       ├── [token]/          # Accept an invite
│   │       └── qr_code/          # QR code encoder and display
│   ├── q/[code]/                 # QR poster short link: records the scan, then redirects
│   ├── rbac_test/                # Developer-only page for changing user roles
│   └── api/
│       ├── account/              # Account and role endpoints
│       └── events/               # Events, search, sign-ups, invites, members, posters
├── core/                         # Shared code: auth checks, fetch wrapper, query parsing, header
├── features/
│   ├── Account/                  # Users, roles, auth context, user list dialog
│   ├── events/                   # Events, categories, search, calendar, create form
│   └── analytics/                # Posters, scan tracking, charts, QR download
├── components/ui/                # Shared UI components (Button, Card, Badge, Input, Label)
├── lib/                          # Firebase client and admin setup, cn() helper
├── tests/                        # Test runner setup and Firebase mocks
├── functions/                    # Firebase Cloud Functions
├── public/                       # Static files
├── firebase.json                 # Firebase and emulator config
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
└── run_demo.sh                   # Starts the emulators and the dev server
```
