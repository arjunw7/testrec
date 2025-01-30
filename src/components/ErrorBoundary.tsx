import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to your monitoring service here
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReturnHome = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Navigate to home
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
          {/* Logo */}
          <div className="mb-12 flex items-baseline gap-2">
            <h1 className="text-[#025F4C] text-3xl font-bold">inSync</h1>
            <span className="text-[#025F4C]/80 text-sm">by Loop</span>
          </div>

          {/* Error Content */}
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25" />
                    <div className="relative w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Oops! Something went wrong
                  </h2>
                  <p className="text-gray-600">
                    We're sorry for the inconvenience. Our team has been notified and is working to fix this issue.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={this.handleReturnHome}
                    className="w-full h-11 gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </div>
                <div className="border-t bg-gray-50 p-4">
                <details className="text-sm text-gray-700">
                <summary className="cursor-pointer hover:text-[#025F4C]">
                    Technical Details
                </summary>
                <div className="mt-2 space-y-2">
                    <p className="font-mono text-xs bg-white p-2 rounded border">
                    {this.state.error?.toString()}
                    </p>
                    <p className="font-mono text-xs bg-white p-2 rounded border whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                    </p>
                </div>
                </details>
                </div>
            </div>

            {/* Accessibility Note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              If you continue to experience issues, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;