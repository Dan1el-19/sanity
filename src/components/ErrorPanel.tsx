import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Simple error panel with a retry button. Used to surface errors
 * from data fetching operations with a consistent UI.
 */
export type ErrorPanelProps = {
  error: string;
  onReload: () => void;
  title?: string;
};

const ErrorPanel: React.FC<ErrorPanelProps> = ({ error, onReload, title = 'Wystąpił błąd' }) => {
  return (
    <div className="alert alert-error shadow-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>
          <div className="text-sm mt-1">{error}</div>
        </div>
        <button
          type="button"
          onClick={onReload}
          className="btn btn-sm btn-ghost gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
};

export default ErrorPanel;
