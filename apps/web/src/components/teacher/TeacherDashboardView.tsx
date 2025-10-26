/**
 * Teacher Dashboard View Component
 * Displays student analytics, progress, and performance metrics
 */

'use client';

import { useState } from 'react';
import { StudentProgressCard } from './StudentProgressCard';
import { ClassAnalytics } from './ClassAnalytics';
import { StudentList } from './StudentList';
import { RecentActivity } from './RecentActivity';

// Mock data - will be replaced with real API calls
const mockStudents = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    totalSessions: 24,
    averageScore: 87,
    consistency: 92,
    lastActive: '2 hours ago',
    subjects: ['Physics', 'Math'],
    trend: 'up' as const,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    totalSessions: 31,
    averageScore: 94,
    consistency: 88,
    lastActive: '1 day ago',
    subjects: ['Chemistry', 'Biology'],
    trend: 'up' as const,
  },
  {
    id: '3',
    name: 'James Chen',
    email: 'james@example.com',
    totalSessions: 18,
    averageScore: 76,
    consistency: 65,
    lastActive: '3 days ago',
    subjects: ['Math', 'Economics'],
    trend: 'down' as const,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    totalSessions: 29,
    averageScore: 91,
    consistency: 95,
    lastActive: '5 hours ago',
    subjects: ['Physics', 'Chemistry'],
    trend: 'stable' as const,
  },
];

const mockClassStats = {
  totalStudents: 45,
  activeToday: 32,
  averageScore: 85,
  totalSessions: 1243,
  averageSessionDuration: 42, // minutes
  improvementRate: 12, // percentage
};

export function TeacherDashboardView() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View:</span>
        <div className="inline-flex rounded-md border">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                selectedPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={mockClassStats.totalStudents}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          title="Active Today"
          value={mockClassStats.activeToday}
          trend={`${Math.round((mockClassStats.activeToday / mockClassStats.totalStudents) * 100)}%`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          title="Average Score"
          value={`${mockClassStats.averageScore}%`}
          trend={`+${mockClassStats.improvementRate}%`}
          trendPositive
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <StatCard
          title="Total Sessions"
          value={mockClassStats.totalSessions}
          subtitle={`${mockClassStats.averageSessionDuration} min avg`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ClassAnalytics period={selectedPeriod} />
        <RecentActivity students={mockStudents} />
      </div>

      {/* Students List */}
      <StudentList students={mockStudents} />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, trend, trendPositive, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend && (
          <span className={`text-sm font-medium ${trendPositive ? 'text-green-600' : 'text-muted-foreground'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
