'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Shapes, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

const actions = [
  {
    title: 'LeetCode Agent',
    description: 'Practice coding problems with AI assistance.',
    buttonLabel: 'Launch Agent',
    icon: Code2,
    href: ROUTES.LEETCODE_AGENT,
  },
  {
    title: 'HackerRank Agent',
    description: 'Prepare for coding interviews using AI.',
    buttonLabel: 'Open Agent',
    icon: Trophy,
    href: ROUTES.HACKERRANK_AGENT,
  },
  {
    title: 'Course Generator',
    description: 'Generate personalized learning roadmaps.',
    buttonLabel: 'Generate Course',
    icon: BookOpen,
    href: ROUTES.COURSES,
  },
  {
    title: 'DSA Pattern Coach',
    description: 'Learn how to identify DSA patterns.',
    buttonLabel: 'Open Coach',
    icon: Shapes,
    href: ROUTES.DSA_PATTERN,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function QuickActionCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
    >
      {actions.map((action) => (
        <motion.article
          key={action.title}
          variants={cardVariants}
          className="group glass-card flex flex-col p-8"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F9DFF]/20 transition-all duration-[250ms] ease-out group-hover:bg-[#4F9DFF]/30 group-hover:shadow-[0_0_28px_rgba(79,157,255,0.35)]">
            <action.icon
              size={26}
              className="text-[#7EC8FF] transition-transform duration-[250ms] ease-out group-hover:rotate-6"
            />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
            {action.title}
          </h3>
          <p className="mt-2 flex-1 text-base leading-relaxed text-[#D4E4F7]">
            {action.description}
          </p>
          <Link href={action.href} className="mt-6 block">
            <Button className="w-full rounded-2xl" size="lg">
              {action.buttonLabel}
            </Button>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
}
