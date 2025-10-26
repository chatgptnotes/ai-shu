import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight">
            Welcome to <span className="text-primary">AI-Shu</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Your photorealistic AI tutor for personalized, interactive learning in Physics,
            Chemistry, Math, Business, and Economics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="rounded-lg border border-input bg-background px-6 py-3 font-semibold transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <FeatureCard
              title="Personalized Learning"
              description="Adaptive teaching tailored to your learning style and pace"
            />
            <FeatureCard
              title="Interactive Tools"
              description="Whiteboard, quizzes, and real-time collaboration"
            />
            <FeatureCard
              title="Expert Tutoring"
              description="Learn from AI-Shu across multiple subjects and curricula"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
