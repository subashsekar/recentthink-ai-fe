import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2"
            aria-label="RecentThink Home"
          >
            <Image
              src="/recentthink-logo.png"
              alt="RecentThink"
              width={32}
              height={32}
              className="dark:invert"
            />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              RecentThink
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Think smarter with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              AI
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            RecentThink helps you capture, organize, and act on your ideas with the power of
            artificial intelligence.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href={ROUTES.REGISTER}
              className="rounded-lg bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Start for free
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-lg border border-zinc-300 px-8 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} RecentThink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
