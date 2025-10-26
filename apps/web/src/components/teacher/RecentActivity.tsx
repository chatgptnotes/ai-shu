/**
 * Recent Activity Component
 * Displays recent student activity and sessions
 */

'use client';

interface Student {
  id: string;
  name: string;
  email: string;
  totalSessions: number;
  averageScore: number;
  consistency: number;
  lastActive: string;
  subjects: string[];
  trend: 'up' | 'down' | 'stable';
}

interface RecentActivityProps {
  students: Student[];
}

export function RecentActivity({ students }: RecentActivityProps) {
  // Get the 5 most recently active students
  const recentStudents = [...students]
    .sort((a, b) => {
      // Simple time-based sorting using lastActive string
      const timeUnits = { 'hours': 1, 'day': 24, 'days': 24 };
      const getHours = (str: string) => {
        const match = str.match(/(\d+)\s+(hours?|days?)/);
        if (!match) return Infinity;
        const [, num, unit] = match;
        const multiplier = unit.startsWith('day') ? timeUnits['day'] : timeUnits['hours'];
        return parseInt(num) * multiplier;
      };
      return getHours(a.lastActive) - getHours(b.lastActive);
    })
    .slice(0, 5);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <div className="space-y-4">
        {recentStudents.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {student.subjects.join(', ')} • {student.lastActive}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{student.averageScore}%</p>
                <p className="text-xs text-muted-foreground">{student.totalSessions} sessions</p>
              </div>
              {student.trend === 'up' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              )}
              {student.trend === 'down' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              )}
              {student.trend === 'stable' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No recent activity to display
        </div>
      )}
    </div>
  );
}
