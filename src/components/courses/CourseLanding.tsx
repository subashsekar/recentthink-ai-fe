'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Clock, History, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';
import { CourseExampleCards } from './CourseExampleCards';

export function CourseLanding() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative overflow-hidden px-6 py-10 sm:px-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles size={16} />
            RecentThink · Course Generator
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Build a personalized learning path
          </h1>
          <p className="mt-3 text-base leading-relaxed text-secondary-text sm:text-lg">
            Tell us your skill, goal, and constraints. We generate a full course — roadmap, lessons,
            quizzes, projects, and adaptive tips — in one response.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ROUTES.COURSES_NEW}>
              <Button size="lg" className="rounded-2xl">
                <BookOpen size={18} />
                Create learning path
              </Button>
            </Link>
            <Link href={ROUTES.COURSES_DASHBOARD}>
              <Button size="lg" variant="outline" className="rounded-2xl">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
            <Link href={ROUTES.COURSES_HISTORY}>
              <Button size="lg" variant="ghost" className="rounded-2xl">
                <History size={18} />
                History
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Start from an example
          </h2>
        </div>
        <p className="text-sm text-muted">
          Pick a preset to prefill the generator, then customize duration and topics.
        </p>
        <CourseExampleCards />
      </section>
    </div>
  );
}
