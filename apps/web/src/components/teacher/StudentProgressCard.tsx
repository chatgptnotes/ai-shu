/**
 * Student Progress Card Component
 * Displays individual student progress metrics
 */

'use client';

interface StudentProgressCardProps {
  studentId: string;
  studentName: string;
  averageScore: number;
  totalSessions: number;
  consistency: number;
  subjects: string[];
  trend: 'up' | 'down' | 'stable';
  lastActive: string;
}

export function StudentProgressCard({
  studentName,
  averageScore,
  totalSessions,
  consistency,
  subjects,
  trend,
  lastActive,
}: StudentProgressCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        );
      case 'down':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
        );
      case 'stable':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        );
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
            {studentName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-semibold">{studentName}</h3>
            <p className="text-sm text-muted-foreground">{subjects.join(', ')}</p>
          </div>
        </div>
        {getTrendIcon()}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Average Score</p>
          <p className="text-2xl font-bold">{averageScore}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sessions</p>
          <p className="text-2xl font-bold">{totalSessions}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Consistency</p>
          <p className={`text-2xl font-bold ${getConsistencyColor(consistency)}`}>
            {consistency}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <p className="text-xs text-muted-foreground">Last active {lastActive}</p>
        <button className="text-sm font-medium text-primary hover:underline">
          View Details
        </button>
      </div>
    </div>
  );
}
