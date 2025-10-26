'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SessionCard } from './SessionCard';

interface Session {
  id: string;
  subject: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

interface SessionsListProps {
  initialSessions: Session[];
}

export function SessionsList({ initialSessions }: SessionsListProps) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

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
    <div className="space-y-3">
      {sessions.slice(0, 3).map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onDelete={handleDelete}
        />
      ))}
      {sessions.length > 3 && (
        <Link
          href="/sessions"
          className="block text-center text-sm text-primary hover:underline"
        >
          View all sessions ({sessions.length})
        </Link>
      )}
    </div>
  );
}
