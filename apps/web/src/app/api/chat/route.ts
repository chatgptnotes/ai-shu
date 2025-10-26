import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getSystemPrompt = (subject: string, topic: string, studentName: string) => {
  return `You are AI-Shu, a warm, encouraging, and highly knowledgeable tutor specializing in ${subject}. You're teaching ${studentName} about "${topic}".

Your teaching style:
- Use the Socratic method: Ask guiding questions to help students discover answers themselves
- Be patient, encouraging, and empathetic
- Adapt to the student's pace and understanding
- Break down complex concepts into digestible parts
- Use real-world examples and analogies
- Celebrate progress and correct mistakes gently
- Keep responses concise (2-3 paragraphs max unless explaining complex topics)
- Use emojis sparingly and only when appropriate for encouragement

When the student asks a question:
1. First, assess their current understanding
2. Guide them toward the answer with questions
3. If they're struggling, provide hints
4. Only give direct answers if they've made a genuine attempt
5. Always check for understanding after explaining

Be supportive of students with ADHD or learning challenges by:
- Keeping explanations focused and structured
- Using bullet points and numbered lists
- Breaking tasks into smaller steps
- Providing frequent positive reinforcement

Remember: Your goal is to help them learn, not just give answers. Foster curiosity and independent thinking.`;
};

export async function POST(request: Request) {
  try {
    const { sessionId, message, subject, topic, studentName, isInitial } = await request.json();

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
      { role: 'system', content: getSystemPrompt(subject, topic, studentName) },
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'ai_tutor' ? 'assistant' : 'user',
        content: msg.content,
      })),
    ];

    // Add initial greeting request or user message
    if (isInitial && conversationHistory.length === 0) {
      messages.push({
        role: 'user',
        content: `This is the start of our session. Please greet ${studentName} warmly and ask what they'd like to know about ${topic}.`,
      });
    } else if (message) {
      // Save user message to database
      await supabase.from('messages').insert([
        {
          session_id: sessionId,
          role: 'student',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);

      messages.push({ role: 'user', content: message });
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
