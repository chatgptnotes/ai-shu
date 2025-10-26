'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill test credentials in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [formData, setFormData] = useState({
    email: isDevelopment ? 'dev@ai-shu.com' : '',
    password: isDevelopment ? 'DevPass123!' : '',
    confirmPassword: isDevelopment ? 'DevPass123!' : '',
    fullName: isDevelopment ? 'Test Developer' : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log('Attempting signup with:', { email: formData.email });

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
        },
      });

      console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);

        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setError('Please check your email to confirm your account before logging in.');
          setIsLoading(false);
          return;
        }

        // User profile is automatically created by database trigger
        // Redirect to profile setup
        router.push('/auth/setup-profile');
      } else if (data.session === null) {
        // Email confirmation required
        setError('Account created! Please check your email to confirm your account.');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Signup catch error:', err);
      const errorMessage = (err as Error).message || 'An error occurred during signup';
      setError(`Sign up failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Join AI-Shu to start your personalized learning journey
          </CardDescription>
          {isDevelopment && (
            <div className="mt-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                Development Mode: Test credentials pre-filled
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Email: dev@ai-shu.com | Password: DevPass123!
              </p>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <VersionFooter />
    </div>
  );
}
