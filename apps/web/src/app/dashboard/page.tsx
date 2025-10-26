import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { SessionsList } from '@/components/dashboard/SessionsList';
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader';

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
      <AuthenticatedHeader userName={profile.full_name} userRole="student" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Welcome back, {profile.full_name.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats Widget */}
        <div className="mb-8">
          <StatsWidget
            sessions={sessions || []}
            curriculum={profile.curriculum}
            gradeLevel={profile.grade_level}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
              <SessionsList initialSessions={sessions || []} />
            </CardContent>
          </Card>
        </div>
      </main>

      <VersionFooter />
    </div>
  );
}
