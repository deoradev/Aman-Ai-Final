import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
// FIX: Explicitly pass ErrorBoundaryProps and State to Component<ErrorBoundaryProps, State> 
// so that this.props and this.state are correctly typed and accessible in the class.
class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // FIX: state is now correctly typed and accessible via generics
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // FIX: this.state is now correctly typed and accessible via generics
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-50 dark:bg-base-900 p-4 text-center">
            <div className="max-w-md">
                <svg className="w-16 h-16 text-warning-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="mt-4 text-2xl font-bold text-base-800 dark:text-base-200">Something went wrong.</h1>
                <p className="mt-2 text-base-600 dark:text-base-400">
                    We're sorry for the inconvenience. Please try refreshing the page. If the problem persists, please contact support.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    // FIX: this.props.children is now accessible due to proper generic typing above.
    return this.props.children; 
  }
}

export default ErrorBoundary;