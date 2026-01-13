/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI with recovery options.
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  handleReturnHome = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Reload page to reset state
    window.location.href = '/';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full border border-red-500/30 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-400">
                  Don't worry, your progress has been saved
                </p>
              </div>
            </div>

            {/* Error details (dev mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-black/30 rounded-lg p-4 mb-6 border border-red-500/20">
                <p className="text-red-400 font-mono text-sm mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="text-gray-500 font-mono text-xs">
                    <summary className="cursor-pointer hover:text-gray-400">
                      Component Stack
                    </summary>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={this.handleReturnHome}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Return to Menu
              </button>
            </div>

            <p className="text-gray-500 text-sm text-center mt-6">
              If this problem persists, please try refreshing the page
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Training Session Error Boundary
 *
 * Specialized error boundary for training sessions with session-specific recovery.
 */
interface TrainingErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onBackToMenu?: () => void;
}

export function TrainingErrorBoundary({
  children,
  onRetry,
  onBackToMenu
}: TrainingErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      onReset={onRetry}
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full border border-red-500/30 shadow-2xl">
            <div className="text-center">
              <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Session Error
              </h2>

              <p className="text-gray-400 mb-6">
                Something went wrong during your training session. Don't worry, your progress has been saved!
              </p>

              <div className="flex flex-col gap-3">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Restart Session
                  </button>
                )}

                {onBackToMenu && (
                  <button
                    onClick={onBackToMenu}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Back to Menu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
