/**
 * Class Analytics Component
 * Visual charts showing class performance trends
 */

'use client';

interface ClassAnalyticsProps {
  period: 'week' | 'month' | 'quarter';
}

export function ClassAnalytics({ period }: ClassAnalyticsProps) {
  // Mock data for visualization
  const data = {
    week: [
      { day: 'Mon', sessions: 42, avgScore: 84 },
      { day: 'Tue', sessions: 38, avgScore: 86 },
      { day: 'Wed', sessions: 45, avgScore: 82 },
      { day: 'Thu', sessions: 41, avgScore: 88 },
      { day: 'Fri', sessions: 39, avgScore: 85 },
      { day: 'Sat', sessions: 28, avgScore: 87 },
      { day: 'Sun', sessions: 22, avgScore: 89 },
    ],
    month: Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      sessions: Math.floor(Math.random() * 50) + 150,
      avgScore: Math.floor(Math.random() * 15) + 75,
    })),
    quarter: Array.from({ length: 3 }, (_, i) => ({
      month: ['Month 1', 'Month 2', 'Month 3'][i],
      sessions: Math.floor(Math.random() * 100) + 500,
      avgScore: Math.floor(Math.random() * 10) + 80,
    })),
  };

  const currentData = data[period];
  const maxSessions = Math.max(...currentData.map(d => d.sessions));

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>

      {/* Simple Bar Chart */}
      <div className="space-y-3">
        {currentData.map((item, index) => {
          const label = 'day' in item ? item.day : 'week' in item ? item.week : item.month;
          const barWidth = (item.sessions / maxSessions) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{item.sessions} sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-lg transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-12 text-right ${getScoreColor(item.avgScore)}`}>
                  {item.avgScore}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{currentData.reduce((sum, d) => sum + d.sessions, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {Math.round(currentData.reduce((sum, d) => sum + d.avgScore, 0) / currentData.length)}%
          </p>
          <p className="text-sm text-muted-foreground">Avg Score</p>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
