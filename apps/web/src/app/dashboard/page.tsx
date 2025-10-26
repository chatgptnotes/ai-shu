import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';

// Subject icon mapping (Google Material Icons style classes)
const SUBJECT_ICONS: Record<string, { icon: string; color: string }> = {
  mathematics: { icon: '📐', color: 'text-blue-600' },
  physics: { icon: '⚛️', color: 'text-purple-600' },
  chemistry: { icon: '🧪', color: 'text-green-600' },
  biology: { icon: '🧬', color: 'text-emerald-600' },
  'computer science': { icon: '💻', color: 'text-indigo-600' },
  english: { icon: '📚', color: 'text-amber-600' },
  history: { icon: '📜', color: 'text-orange-600' },
  geography: { icon: '🌍', color: 'text-teal-600' },
};

// Calculate session duration in minutes
function getSessionDuration(createdAt: string, updatedAt: string): string {
  const start = new Date(createdAt);
  const end = new Date(updatedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just started';
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/setup-profile');
  }

  // Fetch recent sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">AI-Shu</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile.full_name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Welcome back, {profile.full_name.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">
            Ready to continue your learning journey?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Learning statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-semibold">{sessions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Curriculum</span>
                  <span className="font-semibold">{profile.curriculum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Grade Level</span>
                  <span className="font-semibold">Grade {profile.grade_level}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start New Session */}
          <Card>
            <CardHeader>
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>Begin a new tutoring session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link
                  href="/session/new?subject=physics"
                  className="flex items-center gap-3 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span className="text-xl">{SUBJECT_ICONS.physics.icon}</span>
                  <span>Physics</span>
                </Link>
                <Link
                  href="/session/new?subject=mathematics"
                  className="flex items-center gap-3 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span className="text-xl">{SUBJECT_ICONS.mathematics.icon}</span>
                  <span>Mathematics</span>
                </Link>
                <Link
                  href="/session/new?subject=chemistry"
                  className="flex items-center gap-3 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span className="text-xl">{SUBJECT_ICONS.chemistry.icon}</span>
                  <span>Chemistry</span>
                </Link>
                <Link
                  href="/session/new"
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-input px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  <span>+ More Subjects</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Your latest tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => {
                    const subjectKey = session.subject.toLowerCase();
                    const subjectIcon = SUBJECT_ICONS[subjectKey] || { icon: '📖', color: 'text-gray-600' };
                    const duration = getSessionDuration(session.created_at, session.updated_at);

                    return (
                      <Link
                        key={session.id}
                        href={`/session/${session.id}`}
                        className="block rounded-lg border bg-card p-3 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{subjectIcon.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session.topic}</p>
                            <p className="text-xs text-muted-foreground capitalize">{session.subject}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{new Date(session.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{duration}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {sessions.length > 3 && (
                    <Link
                      href="/sessions"
                      className="block text-center text-sm text-primary hover:underline"
                    >
                      View all sessions ({sessions.length})
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <span className="text-3xl">🎓</span>
                  </div>
                  <p className="mb-2 text-sm font-medium">No sessions yet</p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Start your first AI-powered learning session!
                  </p>
                  <Link
                    href="/session/new"
                    className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Create First Session
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <VersionFooter />
    </div>
  );
}
