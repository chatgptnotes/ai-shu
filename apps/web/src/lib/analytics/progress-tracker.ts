/**
 * Learning Progress Tracker
 * Tracks student learning journey, performance, and insights
 */

export interface LearningSession {
  id: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  messages_count: number;
  created_at: string;
}

export interface ProgressMetrics {
  totalSessions: number;
  totalMinutes: number;
  averageSessionDuration: number;
  topSubjects: Array<{ subject: string; count: number }>;
  recentActivity: Array<{ date: string; sessions: number }>;
  consistencyScore: number; // 0-100
}

export interface SubjectProgress {
  subject: string;
  sessionsCount: number;
  totalMinutes: number;
  topicsExplored: string[];
  lastSessionDate: string;
  averageEngagement: number;
}

export class ProgressTracker {
  /**
   * Calculate overall progress metrics from session data
   */
  static calculateMetrics(sessions: LearningSession[]): ProgressMetrics {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSessionDuration: 0,
        topSubjects: [],
        recentActivity: [],
        consistencyScore: 0,
      };
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const averageSessionDuration = totalMinutes / totalSessions;

    // Calculate top subjects
    const subjectCounts = new Map<string, number>();
    sessions.forEach(session => {
      const count = subjectCounts.get(session.subject) || 0;
      subjectCounts.set(session.subject, count + 1);
    });

    const topSubjects = Array.from(subjectCounts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate recent activity (last 7 days)
    const recentActivity = this.calculateRecentActivity(sessions, 7);

    // Calculate consistency score based on regular study patterns
    const consistencyScore = this.calculateConsistencyScore(sessions);

    return {
      totalSessions,
      totalMinutes,
      averageSessionDuration,
      topSubjects,
      recentActivity,
      consistencyScore,
    };
  }

  /**
   * Calculate progress for each subject
   */
  static calculateSubjectProgress(sessions: LearningSession[]): SubjectProgress[] {
    const subjectMap = new Map<string, LearningSession[]>();

    // Group sessions by subject
    sessions.forEach(session => {
      const subjectSessions = subjectMap.get(session.subject) || [];
      subjectSessions.push(session);
      subjectMap.set(session.subject, subjectSessions);
    });

    // Calculate metrics for each subject
    return Array.from(subjectMap.entries()).map(([subject, subjectSessions]) => {
      const sessionsCount = subjectSessions.length;
      const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      const topicsExplored = [...new Set(subjectSessions.map(s => s.topic))];
      const lastSessionDate = subjectSessions[subjectSessions.length - 1].created_at;

      // Average engagement based on messages and duration
      const averageEngagement = subjectSessions.reduce((sum, s) => {
        const engagementScore = Math.min(100, (s.messages_count / s.duration_minutes) * 10);
        return sum + engagementScore;
      }, 0) / sessionsCount;

      return {
        subject,
        sessionsCount,
        totalMinutes,
        topicsExplored,
        lastSessionDate,
        averageEngagement,
      };
    });
  }

  /**
   * Calculate recent activity for the last N days
   */
  private static calculateRecentActivity(
    sessions: LearningSession[],
    days: number
  ): Array<{ date: string; sessions: number }> {
    const today = new Date();
    const activityMap = new Map<string, number>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap.set(dateStr, 0);
    }

    // Count sessions per day
    sessions.forEach(session => {
      const dateStr = session.created_at.split('T')[0];
      if (activityMap.has(dateStr)) {
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
      }
    });

    return Array.from(activityMap.entries())
      .map(([date, sessions]) => ({ date, sessions }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate consistency score (0-100) based on study patterns
   */
  private static calculateConsistencyScore(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    if (sessions.length === 1) return 20;

    // Calculate days with sessions in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSessions = sessions.filter(
      s => new Date(s.created_at) >= thirtyDaysAgo
    );

    const uniqueDays = new Set(
      recentSessions.map(s => s.created_at.split('T')[0])
    );

    // Score based on percentage of days with activity
    const daysWithActivity = uniqueDays.size;
    const consistencyPercentage = (daysWithActivity / 30) * 100;

    // Bonus for consecutive days
    const consecutiveDays = this.calculateConsecutiveDays(Array.from(uniqueDays));
    const consecutiveBonus = Math.min(20, consecutiveDays * 2);

    return Math.min(100, Math.round(consistencyPercentage + consecutiveBonus));
  }

  /**
   * Calculate longest streak of consecutive days
   */
  private static calculateConsecutiveDays(dates: string[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = dates.sort();
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  /**
   * Generate learning insights based on progress data
   */
  static generateInsights(metrics: ProgressMetrics, subjectProgress: SubjectProgress[]): string[] {
    const insights: string[] = [];

    // Consistency insights
    if (metrics.consistencyScore >= 75) {
      insights.push('Great consistency! Keep up the regular study habit.');
    } else if (metrics.consistencyScore >= 50) {
      insights.push('Good progress! Try to study a bit more regularly for better results.');
    } else {
      insights.push('Building a regular study routine will help you learn more effectively.');
    }

    // Session duration insights
    if (metrics.averageSessionDuration < 10) {
      insights.push('Consider longer sessions (15-30 minutes) for deeper understanding.');
    } else if (metrics.averageSessionDuration > 60) {
      insights.push('Great focus! Remember to take breaks to maintain quality.');
    }

    // Subject diversity insights
    if (metrics.topSubjects.length === 1) {
      insights.push('You might benefit from exploring related subjects for a broader understanding.');
    } else if (metrics.topSubjects.length >= 3) {
      insights.push('Excellent subject diversity! This helps build comprehensive knowledge.');
    }

    // Engagement insights
    const avgEngagement = subjectProgress.reduce((sum, sp) => sum + sp.averageEngagement, 0) / subjectProgress.length;
    if (avgEngagement < 30) {
      insights.push('Try asking more questions during sessions to deepen your understanding.');
    } else if (avgEngagement > 70) {
      insights.push('Your active engagement is excellent! This shows great learning curiosity.');
    }

    return insights;
  }
}
