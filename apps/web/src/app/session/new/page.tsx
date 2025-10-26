import { Suspense } from 'react';
import { NewSessionForm } from './NewSessionForm';

export default function NewSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <NewSessionForm />
    </Suspense>
  );
}
