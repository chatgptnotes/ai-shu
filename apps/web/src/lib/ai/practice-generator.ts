/**
 * Practice Problems Generator
 * Generates adaptive practice problems based on student level and topic
 */

export interface PracticeProblem {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  solution: string;
  explanation: string;
  tags: string[];
}

export interface PracticeSet {
  subject: string;
  topic: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  problems: PracticeProblem[];
  estimatedTime: number; // minutes
}

export class PracticeGenerator {
  /**
   * Generate a set of practice problems adapted to student level
   */
  static async generateProblems(
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<PracticeSet> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Return mock problems if no API key
      return this.generateMockProblems(subject, topic, difficulty, count);
    }

    const prompt = `Generate ${count} practice problems for a student learning about "${topic}" in ${subject}.

Difficulty Level: ${difficulty}

Requirements:
- Problems should follow the Three-C Model: build curiosity, ensure conceptual clarity, then test mastery
- Include problems that test understanding, not just memorization
- Provide helpful hints that guide without giving away answers
- Include detailed explanations that teach the underlying concepts
- Make problems progressively challenging

Please provide the problems in this JSON format:
{
  "problems": [
    {
      "id": "unique-id",
      "question": "the problem statement",
      "difficulty": "${difficulty}",
      "hints": ["hint 1", "hint 2", "hint 3"],
      "solution": "the complete solution",
      "explanation": "detailed explanation of concepts and reasoning",
      "tags": ["relevant", "concept", "tags"]
    }
  ],
  "estimatedTime": total_minutes_for_all_problems
}

Focus on deep understanding over rote memorization.`;

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
            {
              role: 'system',
              content: 'You are an expert educator who creates thought-provoking practice problems that build deep understanding.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate practice problems');
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        subject,
        topic,
        difficultyLevel: difficulty,
        problems: result.problems,
        estimatedTime: result.estimatedTime,
      };
    } catch (error) {
      console.error('Error generating practice problems:', error);
      return this.generateMockProblems(subject, topic, difficulty, count);
    }
  }

  /**
   * Generate mock problems for development/testing
   */
  private static generateMockProblems(
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number
  ): PracticeSet {
    const problems: PracticeProblem[] = [];

    for (let i = 1; i <= count; i++) {
      problems.push({
        id: `mock-${difficulty}-${i}`,
        question: `Practice problem ${i} on ${topic}: Apply the concepts we discussed to solve this ${difficulty} level challenge. ${this.getMockQuestionText(difficulty)}`,
        difficulty,
        hints: [
          'Start by identifying what you know and what you need to find',
          'Break the problem into smaller, manageable steps',
          'Remember the key concepts we covered in the session',
        ],
        solution: `Solution for problem ${i}: Follow the systematic approach we learned. [Detailed solution would be provided here based on the specific problem]`,
        explanation: `This problem tests your understanding of ${topic}. The key insight is to apply the foundational principles while considering the specific context. Remember: understanding "why" is more important than memorizing "what".`,
        tags: [topic, subject, difficulty, 'conceptual-understanding'],
      });
    }

    return {
      subject,
      topic,
      difficultyLevel: difficulty,
      problems,
      estimatedTime: count * this.getTimePerProblem(difficulty),
    };
  }

  private static getMockQuestionText(difficulty: 'easy' | 'medium' | 'hard'): string {
    switch (difficulty) {
      case 'easy':
        return 'Focus on applying the basic concepts directly.';
      case 'medium':
        return 'This requires combining multiple concepts and thinking through the connections.';
      case 'hard':
        return 'This challenges you to think critically and apply concepts in a new context.';
    }
  }

  private static getTimePerProblem(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy':
        return 5;
      case 'medium':
        return 10;
      case 'hard':
        return 15;
    }
  }

  /**
   * Adapt difficulty based on student performance
   */
  static adaptDifficulty(
    currentDifficulty: 'easy' | 'medium' | 'hard',
    correctAnswers: number,
    totalProblems: number
  ): 'easy' | 'medium' | 'hard' {
    const accuracy = correctAnswers / totalProblems;

    if (accuracy >= 0.8 && currentDifficulty !== 'hard') {
      // Student is doing well, increase difficulty
      return currentDifficulty === 'easy' ? 'medium' : 'hard';
    } else if (accuracy < 0.5 && currentDifficulty !== 'easy') {
      // Student is struggling, decrease difficulty
      return currentDifficulty === 'hard' ? 'medium' : 'easy';
    }

    return currentDifficulty;
  }

  /**
   * Generate a detailed performance report
   */
  static generatePerformanceReport(
    problems: PracticeProblem[],
    answers: Array<{ problemId: string; correct: boolean; timeSpent: number }>
  ): {
    accuracy: number;
    averageTime: number;
    strengthAreas: string[];
    improvementAreas: string[];
    recommendations: string[];
  } {
    const correct = answers.filter(a => a.correct).length;
    const accuracy = (correct / answers.length) * 100;
    const averageTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length;

    // Analyze by difficulty
    const byDifficulty = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    answers.forEach(answer => {
      const problem = problems.find(p => p.id === answer.problemId);
      if (problem) {
        byDifficulty[problem.difficulty].total++;
        if (answer.correct) {
          byDifficulty[problem.difficulty].correct++;
        }
      }
    });

    // Generate insights
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    if (byDifficulty.easy.correct / byDifficulty.easy.total >= 0.8) {
      strengthAreas.push('Strong foundation in basic concepts');
    } else {
      improvementAreas.push('Review fundamental concepts');
      recommendations.push('Spend more time on foundational topics before moving to complex problems');
    }

    if (byDifficulty.hard.correct / byDifficulty.hard.total >= 0.6) {
      strengthAreas.push('Excellent problem-solving skills');
    }

    if (accuracy >= 80) {
      recommendations.push('You\'re ready for more challenging material!');
    } else if (accuracy >= 60) {
      recommendations.push('Good progress! Focus on areas where you struggled.');
    } else {
      recommendations.push('Review the concepts and try again with easier problems first.');
    }

    if (averageTime > 20) {
      recommendations.push('Take your time to understand - speed will come with practice.');
    }

    return {
      accuracy,
      averageTime,
      strengthAreas,
      improvementAreas,
      recommendations,
    };
  }
}
