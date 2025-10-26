import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VersionFooter } from '@/components/layout/VersionFooter';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader';

export default async function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader userName={profile.full_name} userRole="student" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <ProfileForm
            profile={profile}
            userEmail={user.email || ''}
          />
        </div>
      </main>

      <VersionFooter />
    </div>
  );
}
