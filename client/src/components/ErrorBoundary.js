import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <AlertTriangle size={64} />
            </div>

            <h1 className="error-boundary-title">Что-то пошло не так</h1>

            <p className="error-boundary-message">
              Произошла ошибка при отображении этой страницы.
              {this.state.errorCount > 1 && ` (Ошибка повторилась ${this.state.errorCount} раз)`}
            </p>

            <div className="error-boundary-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                <RefreshCw size={16} />
                Попробовать снова
              </button>

              <button onClick={this.handleGoHome} className="btn btn-secondary">
                <Home size={16} />
                На главную
              </button>

              <button onClick={this.handleReload} className="btn btn-secondary">
                Перезагрузить страницу
              </button>
            </div>

            {isDevelopment && this.state.error && (
              <details className="error-boundary-details">
                <summary>Детали ошибки (только в development режиме)</summary>
                <div className="error-boundary-stack">
                  <h3>Error:</h3>
                  <pre>{this.state.error.toString()}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .error-boundary-content {
              background: white;
              border-radius: 12px;
              padding: 48px;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
            }

            .error-boundary-icon {
              color: #dc3545;
              margin-bottom: 24px;
              display: flex;
              justify-content: center;
            }

            .error-boundary-title {
              font-size: 32px;
              font-weight: 700;
              color: #333;
              margin-bottom: 16px;
            }

            .error-boundary-message {
              font-size: 16px;
              color: #6c757d;
              margin-bottom: 32px;
              line-height: 1.6;
            }

            .error-boundary-actions {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-bottom: 24px;
            }

            .error-boundary-actions .btn {
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 12px 24px;
              font-size: 16px;
            }

            .error-boundary-details {
              margin-top: 24px;
              text-align: left;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 16px;
            }

            .error-boundary-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #495057;
              user-select: none;
            }

            .error-boundary-details summary:hover {
              color: #007bff;
            }

            .error-boundary-stack {
              margin-top: 16px;
            }

            .error-boundary-stack h3 {
              font-size: 14px;
              font-weight: 600;
              color: #495057;
              margin-bottom: 8px;
              margin-top: 16px;
            }

            .error-boundary-stack h3:first-child {
              margin-top: 0;
            }

            .error-boundary-stack pre {
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              padding: 12px;
              overflow-x: auto;
              font-size: 12px;
              color: #dc3545;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            @media (max-width: 768px) {
              .error-boundary-content {
                padding: 32px 24px;
              }

              .error-boundary-title {
                font-size: 24px;
              }

              .error-boundary-actions {
                gap: 8px;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
