import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Logo } from '@/components/ui/Logo';

export default function HomePage() {
  return (
    <div className="flex min-h-screen animate-fade-in flex-col bg-white">
      <header className="animate-slide-down border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between pl-3 pr-0">
          <Link
            href={ROUTES.HOME}
            aria-label="RecentThink Home"
            className="flex items-center transition-all duration-200 hover:scale-[1.02]"
          >
            <Logo width={48} height={48} showText textClassName="text-zinc-900" />
          </Link>
          <div className="flex items-center gap-4 pr-0">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-zinc-600 transition-all duration-200 hover:text-zinc-900"
            >
              Sign in
            </Link>
            <Link href={ROUTES.REGISTER}>
              <span className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
                Get started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1
            className="animate-slide-up text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            Think. Analyze.
            <br />
            <span className="text-primary">Automate</span> with AI.
          </h1>
          <p
            className="animate-fade-up mt-6 text-lg text-zinc-500"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            RecentThink helps you capture, organize, and act on your ideas with intelligent AI
            agents.
          </p>
          <div
            className="mt-12 flex animate-fade-up items-center justify-center gap-4"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <Link href={ROUTES.REGISTER}>
              <span className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
                Start for free
              </span>
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="inline-block rounded-xl border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:border-zinc-400 hover:text-zinc-900 hover:shadow-sm active:scale-[0.97]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} RecentThink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
