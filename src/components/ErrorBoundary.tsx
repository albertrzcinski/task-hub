import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Box, Button, Container, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Here you could send error to logging service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Ups! Coś poszło nie tak
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Aplikacja napotkała nieoczekiwany błąd. Spróbuj odświeżyć stronę.
              </Typography>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}
            </Alert>

            <Box display="flex" gap={2} justifyContent="center">
              <Button variant="contained" onClick={this.handleReset} startIcon={<RefreshIcon />}>
                Spróbuj ponownie
              </Button>

              <Button variant="outlined" onClick={() => window.location.reload()}>
                Odśwież stronę
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
