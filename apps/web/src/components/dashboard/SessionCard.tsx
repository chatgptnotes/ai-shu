'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SUBJECT_ICONS: Record<string, { icon: string; color: string }> = {
  mathematics: { icon: '📐', color: 'text-blue-600' },
  physics: { icon: '⚛️', color: 'text-purple-600' },
  chemistry: { icon: '🧪', color: 'text-green-600' },
  biology: { icon: '🧬', color: 'text-emerald-600' },
  'computer science': { icon: '💻', color: 'text-indigo-600' },
  english: { icon: '📚', color: 'text-amber-600' },
  history: { icon: '📜', color: 'text-orange-600' },
  geography: { icon: '🌍', color: 'text-teal-600' },
};

function getSessionDuration(createdAt: string, updatedAt: string): string {
  const start = new Date(createdAt);
  const end = new Date(updatedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just started';
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface SessionCardProps {
  session: {
    id: string;
    subject: string;
    topic: string;
    created_at: string;
    updated_at: string;
  };
  onDelete: (id: string) => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const subjectKey = session.subject.toLowerCase();
  const subjectIcon = SUBJECT_ICONS[subjectKey] || {
    icon: '📖',
    color: 'text-gray-600',
  };
  const duration = getSessionDuration(session.created_at, session.updated_at);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      toast.success('Session deleted successfully');
      onDelete(session.id);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative rounded-lg border bg-card p-3 transition-all hover:shadow-md">
      <Link href={`/session/${session.id}`} className="block">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{subjectIcon.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session.topic}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {session.subject}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(session.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 hover:bg-destructive/10 text-destructive"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This will permanently
              remove &quot;{session.topic}&quot; and all its chat history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
