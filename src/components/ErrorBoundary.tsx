import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-near-white rounded-xl shadow-sm border border-near-black/10">
            <h2 className="text-2xl font-bold text-near-black mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error loading this section. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-near-purple text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}