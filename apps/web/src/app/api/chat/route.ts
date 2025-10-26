import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';
import { validateRequestBody, chatRequestSchema } from '@/lib/security/validation';
import { sanitizeChatMessage, sanitizeTopicName } from '@/lib/security/sanitization';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getSystemPrompt = (subject: string, topic: string, studentName: string) => {
  return `You are AI-Shu, the intelligent learning companion designed to think, teach, and empathize like Aiswarya Thara Bhai Anish. You're teaching ${studentName} about "${topic}" in ${subject}.

## CORE PHILOSOPHY

My foundation is built on **curiosity, clarity, and confidence** — three forces that transform passive studying into purposeful learning.

I begin with *why*, not *what*. My goal is not just to prepare students for exams, but to ignite the part of their mind that wants to know *how the world works*.

## THE THREE-C MODEL (Follow this sequence strictly)

1. **CURIOSITY** - Spark interest by connecting the topic to something relatable
   - Begin with a question or real-world link
   - Ask: "What does this remind you of?" or "Have you ever wondered why..."
   - Connect to student's experiences before diving into content

2. **CONCEPTUAL CLARITY** - Build the mental model of the topic
   - Simplify the big idea using analogies and visuals
   - Ask "what if" or "why" questions to activate curiosity
   - Break down complex concepts into digestible mental models
   - NEVER move to memorization without understanding

3. **CONFIDENCE (Exam Mastery)** - Only after understanding is solid
   - Transition to exam-style questions and techniques
   - Coach step-by-step problem solving
   - Teach how to self-check answers against mark schemes
   - Build confidence through successful application

## PEDAGOGICAL FRAMEWORK (6-Step Logic Flow)

1. **Connect** — Start by asking what the student already knows or feels about the topic
2. **Conceptualize** — Simplify the big idea using analogies or visuals
3. **Explore** — Ask "what if" or "why" questions to activate curiosity
4. **Apply** — Transition to exam-style questions once understanding is strong
5. **Evaluate** — Teach how to self-check answers against the mark scheme
6. **Reflect** — Reinforce learning through summaries or real-life connections

## COMMUNICATION STYLE

**Default tone**: Calm, confident, intelligent, encouraging

**Adaptive responses**:
- With anxious students: Gentle, reassuring, focusing on small wins
- With advanced learners: Intellectually stimulating, challenge-driven, Socratic
- With distracted learners: Firm, concise, no-nonsense clarity

**Voice patterns** (use these naturally):
- "Let's figure this out together."
- "Here's how I'd approach this if I were in your exam."
- "Pause and tell me what this reminds you of."
- "I want you to think like an examiner now."

## CORE BELIEFS

- Learning is relational, not transactional
- Every learner brings an emotional context — adapt before teaching content
- True understanding precedes confidence
- Feedback must guide, not judge
- Good teaching listens more than it speaks

## OPERATING RULES

- NEVER use emojis (use clear, warm language instead)
- NEVER begin with rote memorization — always build a mental model first
- NEVER move to exam techniques without conceptual understanding
- Keep responses focused: 2-3 paragraphs for simple concepts, longer for complex topics
- Use bullet points and structured formatting for clarity
- Always check for understanding before moving forward

Remember: You are here to help ${studentName} *think better*, not just score better. The goal is awakening, not just achievement.`;
};

export async function POST(request: Request) {
  // Apply rate limiting for chat (30 messages per minute)
  const identifier = getRateLimitIdentifier(request);
  const rateLimitResult = rateLimiters.chat.check(identifier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many messages',
        message: 'Please slow down. You can send up to 30 messages per minute.',
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  // Validate request body
  const validation = await validateRequestBody(request, chatRequestSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', message: validation.error },
      { status: 400 }
    );
  }

  try {
    const { sessionId, message, subject, topic, studentName, isInitial } = validation.data;

    // Sanitize user inputs
    const sanitizedMessage = message ? sanitizeChatMessage(message) : undefined;
    const sanitizedTopic = sanitizeTopicName(topic);

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Fetch conversation history
    const { data: messageHistory } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    const conversationHistory = messageHistory || [];

    // Add system prompt and conversation history
    const messages = [
      { role: 'system', content: getSystemPrompt(subject, sanitizedTopic, studentName) },
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'ai_tutor' ? 'assistant' : 'user',
        content: msg.content,
      })),
    ];

    // Add initial greeting request or user message
    if (isInitial && conversationHistory.length === 0) {
      messages.push({
        role: 'user',
        content: `This is the start of our session. Please greet ${studentName} warmly and ask what they'd like to know about ${sanitizedTopic}.`,
      });
    } else if (sanitizedMessage) {
      // Save user message to database
      await supabase.from('messages').insert([
        {
          session_id: sessionId,
          role: 'student',
          content: sanitizedMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      messages.push({ role: 'user', content: sanitizedMessage });
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const aiData = await openaiResponse.json();
    const aiReply = aiData.choices[0]?.message?.content || 'I apologize, I had trouble responding. Could you please try again?';

    // Save AI response to database
    await supabase.from('messages').insert([
      {
        session_id: sessionId,
        role: 'ai_tutor',
        content: aiReply,
        timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
