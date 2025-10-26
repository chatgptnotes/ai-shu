import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch session messages
    const { data: messages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('role, content, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages found for this session' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate summary using OpenAI (mock for now if API key not provided)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let summary = '';
    let keyConcepts: string[] = [];

    if (openaiApiKey) {
      const conversationText = messages
        .map((m) => `${m.role === 'student' ? 'Student' : 'AI-Shu'}: ${m.content}`)
        .join('\n');

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an educational assistant. Summarize the tutoring session and identify key concepts covered.',
            },
            {
              role: 'user',
              content: `Summarize this tutoring session and list key concepts:\n\n${conversationText}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      const openaiData = await openaiResponse.json();
      summary = openaiData.choices[0]?.message?.content || 'Summary generation failed';
      keyConcepts = ['Topic analysis pending']; // You could do a second call to extract key concepts
    } else {
      // Mock summary when OpenAI key not available
      summary = `Session covered ${messages.length} exchanges. Mock summary - configure OPENAI_API_KEY for AI-generated summaries.`;
      keyConcepts = ['Mock concept 1', 'Mock concept 2'];
    }

    // Update session with summary
    const { error: updateError } = await supabaseClient
      .from('sessions')
      .update({ summary, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          summary,
          key_concepts: keyConcepts,
          message_count: messages.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
