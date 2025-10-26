import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';


export const dynamic = 'force-dynamic';
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve params for Next.js 14/15 compatibility
    const resolvedParams = params instanceof Promise ? await params : params;
    const sessionId = resolvedParams.id;

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Delete the session (only if it belongs to the user)
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('student_id', profile.id);

    if (deleteError) {
      console.error('Error deleting session:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
