#!/bin/bash

export NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-event-planner
export NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-event-planner.firebaseapp.com
export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8081

npx firebase-tools emulators:start --only auth,firestore --project demo-event-planner &
FIREBASE_PID=$!

trap 'kill $FIREBASE_PID 2>/dev/null' EXIT

yarn dev --webpack
