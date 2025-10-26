/**
 * Student List Component
 * Table view of all students with progress metrics
 */

'use client';

import Link from 'next/link';

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

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Students</h2>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/teacher/students/${student.id}`}
              className="block rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
                <TrendBadge trend={student.trend} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Score</p>
                  <p className="font-medium">{student.averageScore}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sessions</p>
                  <p className="font-medium">{student.totalSessions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Consistency</p>
                  <p className="font-medium">{student.consistency}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Subjects</th>
                <th className="pb-3 font-medium text-right">Sessions</th>
                <th className="pb-3 font-medium text-right">Avg Score</th>
                <th className="pb-3 font-medium text-right">Consistency</th>
                <th className="pb-3 font-medium">Last Active</th>
                <th className="pb-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4">
                    <Link href={`/teacher/students/${student.id}`} className="hover:underline">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 text-right">{student.totalSessions}</td>
                  <td className="py-4 text-right">
                    <span className={getScoreColor(student.averageScore)}>
                      {student.averageScore}%
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${student.consistency}%` }}
                        />
                      </div>
                      <span className="text-sm">{student.consistency}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{student.lastActive}</td>
                  <td className="py-4 text-right">
                    <TrendBadge trend={student.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const config = {
    up: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: '↗',
    },
    down: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: '↘',
    },
    stable: {
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      icon: '→',
    },
  };

  const { color, bg, icon } = config[trend];

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${bg} ${color}`}>
      {icon}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 font-medium';
  if (score >= 75) return 'text-blue-600 font-medium';
  if (score >= 60) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
}
