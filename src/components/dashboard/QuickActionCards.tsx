'use client';

import { motion } from 'framer-motion';
import { BookOpen, Code2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const actions = [
  {
    title: 'LeetCode Agent',
    description: 'Practice coding problems with AI assistance.',
    buttonLabel: 'Launch Agent',
    icon: Code2,
  },
  {
    title: 'HackerRank Agent',
    description: 'Prepare for coding interviews using AI.',
    buttonLabel: 'Open Agent',
    icon: Trophy,
  },
  {
    title: 'Course Generator',
    description: 'Generate personalized learning roadmaps.',
    buttonLabel: 'Generate Course',
    icon: BookOpen,
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
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {actions.map((action) => (
        <motion.article
          key={action.title}
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="group flex flex-col rounded-[28px] border border-border bg-surface p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:shadow-[0_0_24px_rgba(255,90,54,0.2)]">
            <action.icon
              size={26}
              className="text-primary transition-transform duration-300 group-hover:rotate-6"
            />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground">{action.title}</h3>
          <p className="mt-2 flex-1 text-base leading-relaxed text-muted">{action.description}</p>
          <Button
            className="mt-6 w-full rounded-2xl shadow-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,90,54,0.25)]"
            size="lg"
          >
            {action.buttonLabel}
          </Button>
        </motion.article>
      ))}
    </motion.div>
  );
}
