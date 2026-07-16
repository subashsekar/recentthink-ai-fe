# RecentThink AI Frontend

The frontend application for RecentThink AI, built with Next.js 16, React 19,
TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 20 or later
- npm
- The RecentThink gateway running on port `8085`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

   The required environment variable is:

   ```env
   NEXT_PUBLIC_GATEWAY_URL=http://localhost:8085
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3003](http://localhost:3003) in your browser.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — start the production server
- `npm run lint` — run ESLint
- `npm run lint:fix` — fix lint issues
- `npm run type-check` — run TypeScript checks
- `npm run format` — format source files
- `npm run format:check` — check source formatting
- `npm test` — run the test suite
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage
