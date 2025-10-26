/**
 * Session Summary Generator
 * Uses AI to generate comprehensive session summaries and study notes
 */

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

export interface SessionSummary {
  keyTopics: string[];
  conceptsCovered: string[];
  learningHighlights: string[];
  areasForReview: string[];
  nextSteps: string[];
  studyNotes: string;
  estimatedComprehension: number; // 0-100
}

export class SessionSummaryGenerator {
  /**
   * Generate a comprehensive session summary using AI
   */
  static async generateSummary(
    sessionData: {
      subject: string;
      topic: string;
      messages: Message[];
      durationMinutes: number;
    }
  ): Promise<SessionSummary> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return mock summary if no API key
      return this.generateMockSummary(sessionData);
    }

    const conversationText = sessionData.messages
      .map(m => `${m.role === 'student' ? 'Student' : 'AI-Shu'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Analyze the following tutoring session and generate a comprehensive summary.

Subject: ${sessionData.subject}
Topic: ${sessionData.topic}
Duration: ${sessionData.durationMinutes} minutes

Conversation:
${conversationText}

Please provide a detailed analysis in the following JSON format:
{
  "keyTopics": ["array of main topics discussed"],
  "conceptsCovered": ["array of specific concepts explained"],
  "learningHighlights": ["array of breakthrough moments or strong understanding shown"],
  "areasForReview": ["array of topics that need more practice"],
  "nextSteps": ["array of recommended next learning steps"],
  "studyNotes": "comprehensive markdown-formatted study notes covering the session",
  "estimatedComprehension": 0-100 (estimated student understanding level)
}

Focus on actionable insights and specific examples from the conversation.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an educational analyst specializing in learning assessment and summary generation.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      const summary = JSON.parse(data.choices[0].message.content);
      return summary;
    } catch (error) {
      console.error('Error generating session summary:', error);
      return this.generateMockSummary(sessionData);
    }
  }

  /**
   * Generate a mock summary for development/testing
   */
  private static generateMockSummary(sessionData: {
    subject: string;
    topic: string;
    messages: Message[];
    durationMinutes: number;
  }): SessionSummary {
    return {
      keyTopics: [sessionData.topic, 'Foundational concepts', 'Practical applications'],
      conceptsCovered: [
        'Core principles and theory',
        'Real-world examples and use cases',
        'Problem-solving techniques',
      ],
      learningHighlights: [
        'Strong grasp of fundamental concepts',
        'Good questions showing curiosity',
        'Ability to connect ideas to prior knowledge',
      ],
      areasForReview: [
        'Practice with more complex problems',
        'Review edge cases and exceptions',
      ],
      nextSteps: [
        `Continue exploring advanced topics in ${sessionData.subject}`,
        'Try practice problems to reinforce understanding',
        'Relate concepts to other subjects you\'re learning',
      ],
      studyNotes: `# ${sessionData.topic} - Study Notes

## Key Concepts
- Understanding the fundamentals of ${sessionData.topic}
- Practical applications and real-world examples
- Problem-solving strategies

## Important Points
1. Focus on understanding the "why" before the "what"
2. Practice regularly to build confidence
3. Connect new concepts to what you already know

## Practice Recommendations
- Review the main concepts covered today
- Try additional problems to test understanding
- Explore related topics for broader knowledge

Session Duration: ${sessionData.durationMinutes} minutes
Total Messages: ${sessionData.messages.length}`,
      estimatedComprehension: Math.min(85, 60 + Math.floor(sessionData.messages.length / 2)),
    };
  }

  /**
   * Export summary as markdown for download
   */
  static exportAsMarkdown(summary: SessionSummary, sessionInfo: {
    subject: string;
    topic: string;
    date: string;
  }): string {
    return `# Session Summary: ${sessionInfo.topic}

**Subject:** ${sessionInfo.subject}
**Date:** ${new Date(sessionInfo.date).toLocaleDateString()}
**Comprehension Level:** ${summary.estimatedComprehension}%

---

## Key Topics Covered
${summary.keyTopics.map(topic => `- ${topic}`).join('\n')}

## Concepts Explained
${summary.conceptsCovered.map(concept => `- ${concept}`).join('\n')}

## Learning Highlights
${summary.learningHighlights.map(highlight => `- ${highlight}`).join('\n')}

## Areas for Review
${summary.areasForReview.map(area => `- ${area}`).join('\n')}

## Recommended Next Steps
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## Study Notes

${summary.studyNotes}

---

*Generated by AI-Shu Learning Platform*
`;
  }
}
