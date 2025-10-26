/**
 * Teacher Dashboard Page
 * Overview of all students' progress and performance
 */

import { Suspense } from 'react';
import { TeacherDashboardView } from '@/components/teacher/TeacherDashboardView';
import { ResponsiveContainer } from '@/components/mobile/ResponsiveContainer';

export const metadata = {
  title: 'Teacher Dashboard | AI-Shu',
  description: 'Monitor student progress and performance',
};

export default function TeacherDashboardPage() {
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your students' progress and performance
            </p>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <TeacherDashboardView />
        </Suspense>
      </div>
    </ResponsiveContainer>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="h-4 w-24 animate-pulse bg-muted rounded" />
            <div className="mt-2 h-8 w-16 animate-pulse bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="h-6 w-32 animate-pulse bg-muted rounded mb-4" />
            <div className="h-64 animate-pulse bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Students Table Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="h-6 w-40 animate-pulse bg-muted rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
