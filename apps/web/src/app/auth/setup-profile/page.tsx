'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';
import type { Curriculum, Language } from '@ai-shu/types';

export default function SetupProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [formData, setFormData] = useState({
    gradeLevel: 9,
    curriculum: 'IB' as Curriculum,
    language: 'en' as Language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUserId(user.id);
      setFullName(user.user_metadata?.full_name || '');
    };

    getUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'gradeLevel' ? parseInt(value, 10) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert([
          {
            user_id: userId,
            full_name: fullName,
            grade_level: formData.gradeLevel,
            curriculum: formData.curriculum,
            language: formData.language,
            timezone: formData.timezone,
          },
        ]);

      if (profileError) throw profileError;

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'An error occurred while setting up your profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>
            Tell us about yourself to personalize your learning experience
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <select
                  id="gradeLevel"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="curriculum">Curriculum</Label>
                <select
                  id="curriculum"
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="IB">International Baccalaureate (IB)</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="Cambridge">Cambridge</option>
                  <option value="CBSE">CBSE</option>
                  <option value="US_Common_Core">US Common Core</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="en">English</option>
                  <option value="zh">Chinese</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  type="text"
                  value={formData.timezone}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Setting up...' : 'Complete setup'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
