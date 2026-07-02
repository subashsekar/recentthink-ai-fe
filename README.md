# RecentThink AI Frontend

Enterprise-grade authentication frontend for the RecentThink SaaS AI platform.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and modern frontend tooling.

## Tech Stack

| Category      | Technology                                     |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js 16 (App Router)                        |
| Language      | TypeScript                                     |
| Styling       | Tailwind CSS v4                                |
| Forms         | React Hook Form + Zod                          |
| HTTP Client   | Axios (with interceptors + auto-refresh token) |
| Server State  | TanStack Query                                 |
| Client State  | Zustand                                        |
| Notifications | React Hot Toast                                |
| Icons         | Lucide React                                   |
| Testing       | Jest + React Testing Library                   |
| Linting       | ESLint + Prettier                              |
| Git Hooks     | Husky + lint-staged                            |

## Folder Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication routes (login, register, etc.)
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── admin/            # Admin routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── not-found.tsx     # 404 page
├── components/           # Reusable components
│   └── ui/               # UI primitives (Button, Input, Modal, etc.)
├── config/               # Application configuration
├── constants/            # Constants and route definitions
├── features/             # Feature-based modules
├── hooks/                # Shared hooks
├── providers/            # React context providers
├── services/             # API service layer
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── styles/               # Global styles
└── assets/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Start development server     |
| `npm run build`         | Build for production         |
| `npm run start`         | Start production server      |
| `npm run lint`          | Run ESLint                   |
| `npm run lint:fix`      | Fix ESLint issues            |
| `npm run type-check`    | Run TypeScript type checking |
| `npm run format`        | Format code with Prettier    |
| `npm run format:check`  | Check code formatting        |
| `npm run test`          | Run tests                    |
| `npm run test:watch`    | Run tests in watch mode      |
| `npm run test:coverage` | Run tests with coverage      |

## Authentication Features

- Register
- Login
- Logout
- Refresh Token (automatic via Axios interceptors)
- Forgot Password
- Reset Password
- Verify Email
- Resend Verification
- Current User
- Change Password

## Pages

| Path                   | Description         | Access     |
| ---------------------- | ------------------- | ---------- |
| `/`                    | Landing page        | Public     |
| `/login`               | Sign in             | Public     |
| `/register`            | Create account      | Public     |
| `/forgot-password`     | Password reset      | Public     |
| `/reset-password`      | Set new password    | Public     |
| `/verify-email`        | Email verification  | Public     |
| `/resend-verification` | Resend verification | Public     |
| `/dashboard`           | User dashboard      | Protected  |
| `/profile`             | Profile & settings  | Protected  |
| `/admin/login`         | Admin sign in       | Public     |
| `/admin/dashboard`     | Admin dashboard     | Admin only |
| `/*`                   | 404 page            | Public     |

## Testing

```bash
npm run test
npm run test:coverage
```

## Docker

### Development

```bash
docker-compose up
```

### Production

```bash
docker build -t recentthink-fe .
docker run -p 3000:3000 recentthink-fe
```

## Deployment

The application is ready for:

- **Vercel** (recommended)
- **AWS Amplify**
- **Azure Static Web Apps**

### Build

```bash
npm run build
```

The output is in the `.next/` directory (standalone mode).

## CI/CD

### CI (Pull Requests)

Every pull request runs:

- `npm install`
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

### CD (Merge to Main)

On merge to main:

- Install dependencies
- Build application
- Upload build artifact
- Ready for deployment

## API Integration

The frontend expects a FastAPI backend with the following endpoints:

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/auth/login`               | Login               |
| POST   | `/api/auth/register`            | Register            |
| POST   | `/api/auth/logout`              | Logout              |
| POST   | `/api/auth/refresh`             | Refresh token       |
| POST   | `/api/auth/forgot-password`     | Forgot password     |
| POST   | `/api/auth/reset-password`      | Reset password      |
| POST   | `/api/auth/verify-email`        | Verify email        |
| POST   | `/api/auth/resend-verification` | Resend verification |
| GET    | `/api/auth/me`                  | Current user        |
| PUT    | `/api/auth/change-password`     | Change password     |

## License

MIT
