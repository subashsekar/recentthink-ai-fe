import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-8xl font-bold text-zinc-200 dark:text-zinc-800">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href={ROUTES.HOME}
          className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
