import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { VersionFooter } from '@/components/layout/VersionFooter';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Next.js 15+ returns params as a Promise, Next.js 14 doesn't
  const resolvedParams = params instanceof Promise ? await params : params;
  const sessionId = resolvedParams.id;

  console.log('SessionPage: Rendering session page for ID:', sessionId);

  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('SessionPage: Error fetching user:', userError);
    redirect('/auth/login');
  }

  if (!user) {
    console.warn('SessionPage: No user found, redirecting to login');
    redirect('/auth/login');
  }

  console.log('SessionPage: User authenticated:', user.id);

  // Fetch student profile
  const { data: profile, error: profileError } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    console.error('SessionPage: Error fetching student profile:', profileError);
    redirect('/auth/setup-profile');
  }

  if (!profile) {
    console.warn('SessionPage: No profile found for user, redirecting to setup');
    redirect('/auth/setup-profile');
  }

  console.log('SessionPage: Student profile found:', profile.id);

  // Fetch session with detailed logging
  console.log('SessionPage: Fetching session with ID:', sessionId, 'for student:', profile.id);

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('student_id', profile.id)
    .single();

  if (sessionError) {
    console.error('SessionPage: Error fetching session:', {
      error: sessionError,
      code: sessionError.code,
      message: sessionError.message,
      details: sessionError.details,
      hint: sessionError.hint,
      sessionId: sessionId,
      studentId: profile.id,
    });
    redirect('/dashboard?error=session_not_found');
  }

  if (!session) {
    console.error('SessionPage: Session data is null despite no error', {
      sessionId: sessionId,
      studentId: profile.id,
    });
    redirect('/dashboard?error=session_not_found');
  }

  console.log('SessionPage: Session fetched successfully:', {
    id: session.id,
    subject: session.subject,
    topic: session.topic,
    status: session.status,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">AI-Shu</h1>
        </div>
      </header>

      <main>
        <ChatInterface
          sessionId={session.id}
          subject={session.subject}
          topic={session.topic}
          studentName={profile.full_name}
        />
      </main>

      <VersionFooter />
    </div>
  );
}
