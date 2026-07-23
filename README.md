# AlgoPilot

AlgoPilot is a personalized coding interview practice companion. It tracks solved problems, records review difficulty, and uses spaced repetition to decide what to revisit next.

## Current focus

- Problem library for curated LeetCode sets
- SM-2 spaced repetition scheduling
- Auth with email/password and Google OAuth
- Progress tracking for solved and due-review problems

## Local setup

Before running the app, install the project dependencies and generate the Prisma client.

## Manual verification

After the dependency install step is complete, check the app in a browser and verify:

- the home page shows AlgoPilot branding
- `/problems` loads the library
- sign-in works
- marking a problem solved updates its state and review timing

## Notes

- Email/password auth is still a prototype in this branch.
- SQLite is used for local development.
- The LeetCode seeding script is available in `scripts/scrapeLeetCode.ts`.
