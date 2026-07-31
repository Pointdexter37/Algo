# AlgoPilot

AlgoPilot is a personalized coding interview companion that helps you solve the right problems, track what you have learned, and revisit weak areas at the right time.

Instead of browsing a huge problem catalog manually, AlgoPilot focuses on curated interview paths such as Blind 75, NeetCode 150/250, and Striver-style sheets, then layers spaced repetition and progress tracking on top.

## What it does

- Curated problem library with study-track support
- Problem solving flow with time spent and difficulty rating
- SM-2 style review scheduling for solved problems
- Personalized dashboard with progress, weak topics, and review queue
- Roadmap, profile, onboarding, and review pages
- Email/password authentication
- PostgreSQL-backed persistence with Prisma

## Screens

- `/` landing page
- `/problems` curated problem library
- `/dashboard` study summary and recommendations
- `/reviews` due and upcoming review queue
- `/roadmap` roadmap selection and study-track overview
- `/onboarding` initial preference setup
- `/profile` user summary and progress view
- `/signup` account creation

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- NextAuth.js

## Prerequisites

- Node.js 18+ or 20+
- npm
- A PostgreSQL database

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

3. Push the Prisma schema to your database:

```bash
npx prisma db push
```

4. Seed the problem library and curated tracks:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start the development server with webpack
- `npm run build` - generate Prisma Client and build the app
- `npm run start` - start the production server
- `npm run lint` - run ESLint
- `npm run db:push` - push the Prisma schema to the database
- `npm run db:seed` - fetch and seed LeetCode problems plus curated tracks

## Data Model

The app stores:

- users and sessions
- problems
- solved submissions
- spaced-repetition progress records
- user preferences
- study tracks and track-to-problem memberships

## How the flow works

1. You sign up or sign in.
2. You pick a study track and preference settings.
3. You browse curated problems in the library.
4. When you solve a problem, you record how hard it felt and how long it took.
5. AlgoPilot schedules the next review based on your input.
6. The dashboard and reviews page help you decide what to do next.

## Deployment

For Vercel:

1. Connect the GitHub repository.
2. Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in Vercel environment variables.
3. Use preview deployments for feature branches.
4. Merge into `main` only when ready for production.

## Notes

- The curated track data is driven by a local seed mapping.
- The problem library is designed around interview-focused sets, not the full LeetCode catalog.
- Google OAuth is not enabled in the current codebase.

## Project Goal

AlgoPilot aims to answer the question:

> "What should I solve next?"

by turning problem practice into a personalized learning loop.
