'use client';

import { useState } from 'react';
import { SessionCard } from './SessionCard';
import Link from 'next/link';

interface Session {
  id: string;
  subject: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

interface SessionsFilterProps {
  initialSessions: Session[];
}

export function SessionsFilter({ initialSessions }: SessionsFilterProps) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  // Get unique subjects
  const uniqueSubjects = Array.from(
    new Set(sessions.map((s) => s.subject.toLowerCase()))
  ).sort();

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !session.topic.toLowerCase().includes(query) &&
        !session.subject.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Subject filter
    if (selectedSubject !== 'all' && session.subject.toLowerCase() !== selectedSubject) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const sessionDate = new Date(session.created_at);
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dateFilter === 'today' && daysDiff > 0) return false;
      if (dateFilter === 'week' && daysDiff > 7) return false;
      if (dateFilter === 'month' && daysDiff > 30) return false;
    }

    return true;
  });

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <span className="text-3xl">🎓</span>
        </div>
        <p className="mb-2 text-sm font-medium">No sessions yet</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Start your first AI-powered learning session!
        </p>
        <Link
          href="/session/new"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create First Session
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="search" className="mb-2 block text-sm font-medium">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by topic or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Subject
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium">
            Date Range
          </label>
          <select
            id="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredSessions.length} of {sessions.length} sessions
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No sessions match your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
