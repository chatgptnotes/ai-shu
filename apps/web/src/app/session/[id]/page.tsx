import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default async function SessionPage({ params }: { params: { id: string } }) {
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

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', params.id)
    .eq('student_id', profile.id)
    .single();

  if (sessionError || !session) {
    redirect('/dashboard');
  }

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
          onEndSession={() => {
            window.location.href = '/dashboard';
          }}
        />
      </main>
    </div>
  );
}
