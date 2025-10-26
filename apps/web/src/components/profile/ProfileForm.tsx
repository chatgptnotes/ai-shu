'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ai-shu/ui';
import { Button } from '@ai-shu/ui';
import { createClient } from '@/lib/supabase/client';

interface ProfileFormProps {
  profile: {
    id: string;
    full_name: string;
    curriculum: string;
    grade_level: number;
  };
  userEmail: string;
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.full_name,
    curriculum: profile.curriculum,
    gradeLevel: profile.grade_level.toString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('student_profiles')
        .update({
          full_name: formData.fullName,
          curriculum: formData.curriculum,
          grade_level: parseInt(formData.gradeLevel),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={userEmail}
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed from this page
            </p>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>
            Customize your AI-Shu learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label
              htmlFor="curriculum"
              className="mb-2 block text-sm font-medium"
            >
              Curriculum
            </label>
            <select
              id="curriculum"
              value={formData.curriculum}
              onChange={(e) =>
                setFormData({ ...formData, curriculum: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="IB">International Baccalaureate (IB)</option>
              <option value="IGCSE">Cambridge IGCSE</option>
              <option value="A-Level">Cambridge A-Level</option>
              <option value="AP">Advanced Placement (AP)</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="gradeLevel"
              className="mb-2 block text-sm font-medium"
            >
              Grade Level
            </label>
            <select
              id="gradeLevel"
              value={formData.gradeLevel}
              onChange={(e) =>
                setFormData({ ...formData, gradeLevel: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Session</span>
              <kbd className="rounded border border-border bg-background px-2 py-1 text-xs font-mono">
                Ctrl + N
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Go to Dashboard</span>
              <kbd className="rounded border border-border bg-background px-2 py-1 text-xs font-mono">
                Ctrl + H
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Help</span>
              <kbd className="rounded border border-border bg-background px-2 py-1 text-xs font-mono">
                Ctrl + /
              </kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Close Dialogs</span>
              <kbd className="rounded border border-border bg-background px-2 py-1 text-xs font-mono">
                Escape
              </kbd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
