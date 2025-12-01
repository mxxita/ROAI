import React from 'react';
import { LucideIcon, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-accent-blue mb-4" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  retry?: () => void;
}

export function ErrorState({ title, message, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-accent-rose/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-accent-rose" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
