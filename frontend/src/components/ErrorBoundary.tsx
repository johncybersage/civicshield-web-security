import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-3xl w-full rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-left overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
                <p className="text-slate-600 dark:text-slate-400">The application encountered an unexpected runtime error.</p>
              </div>
            </div>
            
            <div className="bg-slate-900 text-rose-400 p-4 rounded-lg mb-6 overflow-auto text-xs font-mono">
              <div className="font-bold text-rose-300 mb-2 border-b border-rose-900/50 pb-2">
                {this.state.error?.toString()}
              </div>
              <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
              {/* @ts-ignore */}
              {this.state.errorInfo && <pre className="whitespace-pre-wrap mt-4 text-slate-400">{this.state.errorInfo.componentStack}</pre>}
            </div>

            <div className="flex gap-3 mt-auto shrink-0">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  // @ts-ignore
                  this.setState({ errorInfo: undefined });
                  window.location.href = '/dashboard';
                }}
                className="flex-1 bg-primary-600 text-white font-medium py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
