'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';

const SUBJECT_ICONS: Record<string, string> = {
  mathematics: '📐',
  physics: '⚛️',
  chemistry: '🧪',
  biology: '🧬',
  'computer science': '💻',
  english: '📚',
  history: '📜',
  geography: '🌍',
};

interface Session {
  id: string;
  subject: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

interface StatsWidgetProps {
  sessions: Session[];
  curriculum: string;
  gradeLevel: number;
}

function calculateTotalHours(sessions: Session[]): string {
  let totalMinutes = 0;

  sessions.forEach((session) => {
    const start = new Date(session.created_at);
    const end = new Date(session.updated_at);
    const diffMs = end.getTime() - start.getTime();
    totalMinutes += Math.floor(diffMs / 60000);
  });

  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getFavoriteSubject(sessions: Session[]): {
  subject: string;
  icon: string;
  count: number;
} {
  if (sessions.length === 0) {
    return { subject: 'None yet', icon: '📚', count: 0 };
  }

  const subjectCounts: Record<string, number> = {};

  sessions.forEach((session) => {
    const subject = session.subject.toLowerCase();
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });

  const [favoriteSubject, count] = Object.entries(subjectCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  return {
    subject: favoriteSubject.charAt(0).toUpperCase() + favoriteSubject.slice(1),
    icon: SUBJECT_ICONS[favoriteSubject] || '📚',
    count,
  };
}

function getThisWeekSessions(sessions: Session[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return sessions.filter(
    (session) => new Date(session.created_at) >= oneWeekAgo
  ).length;
}

export function StatsWidget({ sessions, curriculum, gradeLevel }: StatsWidgetProps) {
  const totalHours = calculateTotalHours(sessions);
  const favoriteSubject = getFavoriteSubject(sessions);
  const thisWeekSessions = getThisWeekSessions(sessions);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Sessions</CardDescription>
          <CardTitle className="text-3xl">{sessions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {curriculum} • Grade {gradeLevel}
          </p>
        </CardContent>
      </Card>

      {/* Total Hours */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Time Learned</CardDescription>
          <CardTitle className="text-3xl">{totalHours}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Across all subjects
          </p>
        </CardContent>
      </Card>

      {/* Favorite Subject */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Favorite Subject</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <span>{favoriteSubject.icon}</span>
            <span>{favoriteSubject.subject}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {favoriteSubject.count} {favoriteSubject.count === 1 ? 'session' : 'sessions'}
          </p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>This Week</CardDescription>
          <CardTitle className="text-3xl">{thisWeekSessions}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {thisWeekSessions === 0
              ? 'Start a new session today!'
              : 'Keep up the great work!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
