import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';
import { SessionsFilter } from '@/components/dashboard/SessionsFilter';

export default async function AllSessionsPage() {
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

  // Fetch ALL sessions (no limit)
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-2xl font-bold">
            AI-Shu
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/help"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Help
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {profile.full_name}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">All Sessions</h1>
          <p className="text-muted-foreground">
            View, search, and manage all your learning sessions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Learning Sessions</CardTitle>
            <CardDescription>
              Search and filter through your complete session history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsFilter initialSessions={sessions || []} />
          </CardContent>
        </Card>
      </main>

      <VersionFooter />
    </div>
  );
}
