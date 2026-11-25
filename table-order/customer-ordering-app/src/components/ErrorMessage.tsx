import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
      data-testid="error-message"
    >
      <p className="text-red-600 mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 underline text-sm hover:text-red-700"
          data-testid="error-retry-button"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
