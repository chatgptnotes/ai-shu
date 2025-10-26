import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@ai-shu/ui';
import { VersionFooter } from '@/components/layout/VersionFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl font-bold text-primary">
                AI-Shu
              </Link>
              <span className="text-xs text-muted-foreground/60">by Bettroi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/help"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Help
              </Link>
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
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              About AI-Shu
            </h1>
            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              The intelligent learning companion that awakens curiosity, builds clarity, and creates confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Mission Statement */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-lg">
                  AI-Shu exists to transform education from memorization to understanding. We believe every student deserves a learning experience that awakens curiosity, builds genuine comprehension, and instills lasting confidence.
                </p>
                <p className="text-lg">
                  Founded on the teaching philosophy of Aiswarya Thara Bhai Anish, AI-Shu reimagines how students learn by prioritizing the &quot;why&quot; before the &quot;what&quot;, ensuring that knowledge is built on solid foundations rather than rote memorization.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* The Three-C Model */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">The Three-C Model</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Our proprietary teaching methodology follows a proven three-stage progression:
            </p>

            <div className="space-y-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-2xl">
                      💡
                    </span>
                    <div>
                      <div className="text-2xl">Curiosity</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Spark Interest
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We begin every lesson by connecting the topic to something relatable in the student&apos;s world. Questions like &quot;Have you ever wondered why...&quot; or real-world examples make abstract concepts tangible and interesting. Curiosity is the gateway to genuine learning.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-2xl">
                      🧠
                    </span>
                    <div>
                      <div className="text-2xl">Conceptual Clarity</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Build Understanding
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Once curiosity is sparked, we build mental models through analogies, visual explanations, and guided logic. We never jump to formulas or memorization. Instead, we ensure the student understands the fundamental &quot;why&quot; behind every concept. Understanding is the foundation of mastery.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-2xl">
                      🎯
                    </span>
                    <div>
                      <div className="text-2xl">Confidence (Exam Mastery)</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Achieve Excellence
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Only after conceptual understanding is solid do we transition to exam techniques, mark scheme awareness, and problem-solving strategies. This ensures students don&apos;t just memorize answers—they genuinely understand the material and can apply it confidently in any context.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Core Beliefs */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">Core Beliefs</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Never Begin with Memorization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Formulas and facts come last, not first. We always build mental models before asking students to remember anything.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adaptive Teaching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Every student learns differently. AI-Shu adapts to visual, auditory, and kinesthetic learning styles in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Emotional Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We recognize and respond to student emotions—frustration, curiosity, confidence—adjusting our approach accordingly.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Teach How to Think</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Beyond subject matter, we develop metacognitive awareness—teaching students how to learn, not just what to learn.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technology & Innovation */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">Technology & Innovation</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Powered by GPT-4</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Shu leverages OpenAI&apos;s GPT-4 to provide nuanced, contextual responses that adapt to each student&apos;s unique learning journey.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Real-Time Learning Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress across subjects, identify patterns in your learning, and receive personalized insights to accelerate your growth.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Built for Scale</h3>
                  <p className="text-sm text-muted-foreground">
                    Modern architecture with Next.js, Supabase, and Vercel ensures fast, reliable access whether you&apos;re studying at home or on the go.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Team & Partners */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">Team & Partners</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Founded by Aishu&apos;s Academy</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Shu is built on the proven teaching methodology of Aiswarya Thara Bhai Anish, founder of Aishu&apos;s Academy Pvt. Ltd., with years of experience transforming how students learn.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">In Partnership with Bettroi</h3>
                  <p className="text-sm text-muted-foreground">
                    Bettroi provides strategic support and resources to bring AI-Shu&apos;s vision of accessible, intelligent education to students worldwide.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Developed by DRM Hope Software</h3>
                  <p className="text-sm text-muted-foreground">
                    DRM Hope Software brings technical excellence and innovation to create a seamless, powerful learning platform.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Subjects & Coverage */}
          <section>
            <h2 className="mb-6 text-3xl font-bold">Subjects & Coverage</h2>
            <p className="mb-6 text-muted-foreground">
              AI-Shu currently supports comprehensive learning across multiple subjects for grades 6-12:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Mathematics', icon: '📐' },
                { name: 'Physics', icon: '⚛️' },
                { name: 'Chemistry', icon: '🧪' },
                { name: 'Biology', icon: '🧬' },
                { name: 'Computer Science', icon: '💻' },
                { name: 'English', icon: '📚' },
                { name: 'History', icon: '📜' },
                { name: 'Geography', icon: '🌍' },
              ].map((subject) => (
                <Card key={subject.name}>
                  <CardContent className="flex items-center gap-3 pt-6">
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-medium">{subject.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-12">
                <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Learning?</h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  Experience the Three-C Model and discover how AI-Shu can help you truly understand, not just memorize.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/auth/signup"
                    className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Start Learning Free
                  </Link>
                  <Link
                    href="/help"
                    className="rounded-lg border-2 border-input bg-background px-8 py-4 text-lg font-semibold hover:bg-accent"
                  >
                    Learn More
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <VersionFooter />
    </div>
  );
}
