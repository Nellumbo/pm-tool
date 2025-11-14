import React, { Component } from 'react';

/**
 * Error Boundary компонент для перехвата ошибок в React дереве
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Здесь можно отправить ошибку в сервис логирования
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>⚠️ Что-то пошло не так</h1>
            <p style={styles.message}>
              Произошла ошибка при отображении этой страницы.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Детали ошибки (dev mode)</summary>
                <pre style={styles.error}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={styles.actions}>
              <button style={styles.button} onClick={this.handleReset}>
                Попробовать снова
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => (window.location.href = '/')}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5'
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    marginBottom: '16px',
    color: '#dc3545'
  },
  message: {
    fontSize: '16px',
    marginBottom: '24px',
    color: '#666'
  },
  details: {
    textAlign: 'left',
    marginTop: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#495057'
  },
  error: {
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '300px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: '#dc3545'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s'
  },
  buttonSecondary: {
    backgroundColor: '#6c757d'
  }
};

export default ErrorBoundary;
