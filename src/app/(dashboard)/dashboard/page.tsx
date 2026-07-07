'use client';

import { HeroSection } from '@/components/dashboard/HeroSection';
import { QuickActionCards } from '@/components/dashboard/QuickActionCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <HeroSection />
      <QuickActionCards />
      <RecentActivity />
    </div>
  );
}
