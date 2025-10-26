import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold">
            AI-Shu
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold">Help & FAQ</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Find answers to common questions about AI-Shu
          </p>

          <div className="space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <span>Getting Started</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">How do I start a learning session?</h3>
                  <p className="text-sm text-muted-foreground">
                    From your dashboard, click on any subject button (Physics, Mathematics, Chemistry, etc.)
                    or click &quot;More Subjects&quot; to see all available subjects. Then enter the topic you want
                    to learn about and click &quot;Start Session&quot;.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">What subjects does AI-Shu support?</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Shu currently supports: Mathematics, Physics, Chemistry, Biology, Computer Science,
                    English, History, and Geography. We&apos;re constantly expanding our subject coverage.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Can I continue a previous session?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Click on any session from your &quot;Recent Sessions&quot; list on the dashboard
                    to continue where you left off.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* The Three-C Model */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>The Three-C Model</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">What is the Three-C Model?</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Shu uses a unique teaching approach called the Three-C Model:
                    <strong> Curiosity → Clarity → Confidence</strong>. First, we spark your curiosity
                    by connecting topics to real-world scenarios. Then we build conceptual clarity through
                    analogies and guided logic. Finally, we help you build confidence with exam mastery
                    and problem-solving techniques.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Why doesn&apos;t AI-Shu start with formulas?</h3>
                  <p className="text-sm text-muted-foreground">
                    Traditional tutoring often jumps straight to formulas and memorization. AI-Shu believes
                    in building mental models first. We never begin with rote memorization – we always help
                    you understand the &quot;why&quot; before the &quot;what&quot;.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">How does AI-Shu adapt to my learning style?</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Shu recognizes different learning patterns and adjusts its teaching accordingly.
                    Whether you&apos;re a visual learner who needs diagrams, an auditory learner who prefers
                    explanations, or a kinesthetic learner who learns by doing, AI-Shu adapts to your needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sessions & Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span>Sessions & Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">What do the dashboard statistics mean?</h3>
                  <p className="text-sm text-muted-foreground">
                    Your dashboard shows four key metrics: <strong>Total Sessions</strong> (all learning
                    sessions), <strong>Time Learned</strong> (total hours across all subjects),
                    <strong>Favorite Subject</strong> (subject with most sessions), and
                    <strong>This Week</strong> (sessions in the last 7 days).
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">How do I delete a session?</h3>
                  <p className="text-sm text-muted-foreground">
                    Hover over any session card and click the trash icon that appears. You&apos;ll be asked
                    to confirm before the session is permanently deleted.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Can I see all my past sessions?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! If you have more than 3 sessions, you&apos;ll see a &quot;View all sessions&quot; link
                    at the bottom of the Recent Sessions card.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chat & Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <span>Chat & Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">How do I ask questions during a session?</h3>
                  <p className="text-sm text-muted-foreground">
                    Simply type your question in the chat input at the bottom of the session page and
                    press Enter or click Send. AI-Shu will respond using the Three-C Model approach.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">What if I don&apos;t understand an explanation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Just ask for clarification! AI-Shu is designed to explain concepts in multiple ways.
                    You can ask for simpler explanations, real-world examples, or visual analogies.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Can AI-Shu help with exam preparation?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! After building conceptual understanding, AI-Shu transitions to exam mastery
                    with step-by-step problem solving, mark scheme awareness, and exam techniques.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account & Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span>Account & Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">How do I update my profile information?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can update your name, curriculum, and grade level from your profile page.
                    Click your name in the dashboard header to access profile settings.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Is my data secure?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! All your data is encrypted and stored securely. We use industry-standard
                    security practices and never share your personal information.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Can I change my password?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can update your password from the authentication settings page.
                    We recommend using a strong, unique password.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  <span>Troubleshooting</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">The chat isn&apos;t responding. What should I do?</h3>
                  <p className="text-sm text-muted-foreground">
                    First, check your internet connection. If the issue persists, try refreshing the page.
                    Your chat history is saved automatically, so you won&apos;t lose any progress.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">I can&apos;t see my sessions. What happened?</h3>
                  <p className="text-sm text-muted-foreground">
                    Make sure you&apos;re logged in with the correct account. If you&apos;re using a different
                    browser or device, log in with your original credentials.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">How do I report a bug or give feedback?</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;d love to hear from you! Contact our support team or use the feedback form
                    to report bugs, suggest features, or share your experience with AI-Shu.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Still Need Help */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="mb-2 text-lg font-semibold">Still need help?</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Can&apos;t find what you&apos;re looking for? Check out our detailed guides or contact support.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/about"
                      className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                    >
                      About AI-Shu
                    </Link>
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <VersionFooter />
    </div>
  );
}
