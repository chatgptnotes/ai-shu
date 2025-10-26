import Link from 'next/link';
import { VersionFooter } from '@/components/layout/VersionFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">AI-Shu</h1>
              <span className="text-xs text-muted-foreground/60">by Bettroi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Powered by Aiswarya&apos;s Teaching Philosophy
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Stop Memorizing.
              <br />
              <span className="text-primary">Start Understanding.</span>
            </h1>
            <p className="mb-4 text-xl text-muted-foreground sm:text-2xl">
              AI-Shu doesn&apos;t just teach you answers — it awakens your curiosity,
              builds true understanding, and transforms you into a confident learner.
            </p>
            <p className="mb-10 text-lg text-muted-foreground">
              Experience the revolutionary Three-C Model: Curiosity → Clarity → Confidence
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Start Learning Free
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg border-2 border-input bg-background px-8 py-4 text-lg font-semibold transition-all hover:bg-accent hover:shadow-lg"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · Start in 2 minutes · Join 1000+ students
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Traditional Tutoring Gets It Wrong
            </h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Most tutors jump straight to formulas and exam techniques. Students memorize,
              pass tests, then forget everything. That&apos;s not learning — that&apos;s performance anxiety.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <ProblemCard
                title="Rote Memorization"
                description="Formulas without understanding why they work"
              />
              <ProblemCard
                title="One-Size-Fits-All"
                description="Same teaching style for anxious and advanced learners"
              />
              <ProblemCard
                title="Exam-Only Focus"
                description="Teaching to tests instead of building true mastery"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Three-C Model Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                The Three-C Model
              </h2>
              <p className="text-xl text-muted-foreground">
                How AI-Shu Transforms Learning
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <ThreeCCard
                number="1"
                title="Curiosity"
                subtitle="Spark Interest First"
                description="Before diving into content, AI-Shu connects the topic to something you already know or care about. Real-world examples, thought-provoking questions, and relatable analogies ignite your natural curiosity."
                example="Instead of starting with Newton's Laws, AI-Shu asks: 'Have you ever wondered why you feel pushed back when a car accelerates?'"
              />
              <ThreeCCard
                number="2"
                title="Conceptual Clarity"
                subtitle="Build Mental Models"
                description="No memorization yet. AI-Shu helps you build a clear mental picture of how things work. Through analogies, visuals, and guided questions, you develop true understanding — not surface-level knowledge."
                example="Force isn't just F=ma. It's understanding that mass resists changes in motion, and acceleration is how quickly velocity changes."
              />
              <ThreeCCard
                number="3"
                title="Confidence"
                subtitle="Master the Exam"
                description="Only after understanding is solid does AI-Shu transition to exam techniques, problem-solving strategies, and mark scheme awareness. You approach questions with confidence, not fear."
                example="Now you're ready to solve F=ma problems — and you understand exactly what you're calculating and why it matters."
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-16 text-center text-4xl font-bold">
              Your AI-Shu Learning Journey
            </h2>
            <div className="space-y-12">
              <Step
                number="1"
                title="Connect"
                description="AI-Shu starts by asking what you already know or how you feel about the topic. Learning begins with your experience, not a textbook definition."
              />
              <Step
                number="2"
                title="Conceptualize"
                description="Using analogies and real-world examples, AI-Shu simplifies complex ideas into mental models you can actually understand and remember."
              />
              <Step
                number="3"
                title="Explore"
                description="Through 'what if' and 'why' questions, AI-Shu activates your curiosity and helps you discover answers yourself — true Socratic teaching."
              />
              <Step
                number="4"
                title="Apply"
                description="Once understanding is solid, AI-Shu transitions to exam-style questions and problem-solving techniques tailored to your curriculum."
              />
              <Step
                number="5"
                title="Evaluate"
                description="Learn to self-check your work against mark schemes, developing independence and exam confidence."
              />
              <Step
                number="6"
                title="Reflect"
                description="Reinforce learning through summaries and real-life connections, ensuring knowledge sticks long after the session ends."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Adaptive Teaching Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-4xl font-bold">
              Teaching That Adapts to You
            </h2>
            <p className="mb-16 text-center text-xl text-muted-foreground">
              AI-Shu recognizes your emotional state and learning style, then adjusts in real-time
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <AdaptiveCard
                title="For Anxious Learners"
                approach="Gentle & Reassuring"
                description="AI-Shu focuses on small wins, uses encouraging language, and breaks complex topics into manageable steps. Every achievement is celebrated to build confidence."
              />
              <AdaptiveCard
                title="For Advanced Learners"
                approach="Intellectually Stimulating"
                description="AI-Shu presents challenging scenarios, asks deeper 'what if' questions, and uses the Socratic method to push thinking to the next level."
              />
              <AdaptiveCard
                title="For Distracted Learners"
                approach="Firm & Focused"
                description="AI-Shu keeps explanations concise, uses structured bullet points, and maintains a clear, no-nonsense approach that respects your time."
              />
              <AdaptiveCard
                title="For Struggling Learners"
                approach="Patient & Methodical"
                description="AI-Shu slows down, uses multiple analogies, checks understanding frequently, and never rushes to the next concept until you're ready."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Beliefs Section */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-16 text-center text-4xl font-bold">
              What AI-Shu Believes About Learning
            </h2>
            <div className="space-y-6">
              <BeliefCard
                belief="Every student is teachable — but not in the same way"
                explanation="There&apos;s no such thing as &apos;bad at math&apos; — only teaching that hasn&apos;t connected yet."
              />
              <BeliefCard
                belief="True understanding precedes confidence"
                explanation="When you genuinely understand something, exam anxiety dissolves naturally."
              />
              <BeliefCard
                belief="Learning is relational, not transactional"
                explanation="Your emotional context matters. AI-Shu adapts to how you feel before teaching what you need to know."
              />
              <BeliefCard
                belief="Feedback must guide, not judge"
                explanation="Mistakes are part of learning. AI-Shu corrects gently and explains why, never making you feel inadequate."
              />
              <BeliefCard
                belief="Good teaching listens more than it speaks"
                explanation="AI-Shu asks questions to understand your thinking before offering explanations."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-center text-4xl font-bold">
              Master Any Subject with AI-Shu
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SubjectCard
                subject="Physics"
                topics="Mechanics, Electricity, Waves, Thermodynamics, Modern Physics"
                level="IB, A-Level, AP, IGCSE"
              />
              <SubjectCard
                subject="Chemistry"
                topics="Organic, Inorganic, Physical Chemistry, Stoichiometry, Kinetics"
                level="IB, A-Level, AP, IGCSE"
              />
              <SubjectCard
                subject="Mathematics"
                topics="Algebra, Calculus, Statistics, Geometry, Functions"
                level="IB, A-Level, AP, IGCSE"
              />
              <SubjectCard
                subject="Business"
                topics="Marketing, Finance, Operations, Strategy, HR"
                level="IB, A-Level, IGCSE"
              />
              <SubjectCard
                subject="Economics"
                topics="Micro, Macro, International Trade, Development, Markets"
                level="IB, A-Level, IGCSE"
              />
              <SubjectCard
                subject="More Coming"
                topics="Biology, Computer Science, English Literature"
                level="Expanding curriculum"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why AI-Shu Section */}
      <section className="border-b py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-16 text-center text-4xl font-bold">
              Why Choose AI-Shu?
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <WhyCard
                title="Based on Proven Teaching Philosophy"
                description="Founded on Aiswarya Thara Bhai Anish's teaching methodology — tested with thousands of students across IB, A-Level, and IGCSE programs."
              />
              <WhyCard
                title="Available 24/7"
                description="Learning doesn't follow a schedule. Get help whenever you need it, whether it's 3 PM or 3 AM."
              />
              <WhyCard
                title="Personalized to Your Pace"
                description="Never feel rushed or held back. AI-Shu moves at exactly the speed that works for you."
              />
              <WhyCard
                title="Curriculum-Aligned"
                description="Fully aligned with IB, A-Level, AP, and IGCSE syllabi. AI-Shu knows your mark schemes and exam formats."
              />
              <WhyCard
                title="Progress Tracking"
                description="See your improvement over time with detailed progress reports and mastery tracking across topics."
              />
              <WhyCard
                title="No Judgment Zone"
                description="Ask 'stupid' questions without embarrassment. AI-Shu never judges — only guides and encourages."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
              Ready to Learn Like Never Before?
            </h2>
            <p className="mb-10 text-xl opacity-90">
              Join students who&apos;ve transformed from anxious memorizers to confident thinkers.
              Start your journey with AI-Shu today — completely free.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="rounded-lg bg-background px-8 py-4 text-lg font-semibold text-primary transition-all hover:bg-background/90 hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="rounded-lg border-2 border-primary-foreground bg-transparent px-8 py-4 text-lg font-semibold transition-all hover:bg-primary-foreground/10"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-8 text-sm opacity-75">
              No credit card · 2-minute setup · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <VersionFooter />
    </div>
  );
}

// Component Definitions

function ProblemCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border-2 border-destructive/20 bg-destructive/5 p-6">
      <h3 className="mb-2 font-bold text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ThreeCCard({
  number,
  title,
  subtitle,
  description,
  example,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-xl border-2 border-primary/20 bg-card p-8 shadow-lg transition-all hover:border-primary/40 hover:shadow-xl">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {number}
        </div>
        <div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm italic">Example: {example}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {number}
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function AdaptiveCard({
  title,
  approach,
  description,
}: {
  title: string;
  approach: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-3 text-sm font-semibold text-primary">{approach}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BeliefCard({ belief, explanation }: { belief: string; explanation: string }) {
  return (
    <div className="rounded-lg border-l-4 border-primary bg-card p-6 shadow-sm">
      <h3 className="mb-2 font-bold">{belief}</h3>
      <p className="text-sm text-muted-foreground">{explanation}</p>
    </div>
  );
}

function SubjectCard({
  subject,
  topics,
  level,
}: {
  subject: string;
  topics: string;
  level: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-lg">
      <h3 className="mb-2 text-xl font-bold">{subject}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{topics}</p>
      <p className="text-xs font-semibold text-primary">{level}</p>
    </div>
  );
}

function WhyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
