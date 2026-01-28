/**
 * Error Boundary React
 * Capture les erreurs JavaScript dans l'arbre des composants
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Envoyer à service monitoring (Sentry, LogRocket, etc.)
    // sendErrorToMonitoring(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.hash = '#/';
    this.handleReset();
  };

  public render() {
    if (this.state.hasError) {
      // Fallback custom si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI par défaut
      return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-500/20 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Oups ! Une erreur est survenue
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    L'application a rencontré un problème inattendu
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Message d'erreur */}
              {this.state.error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-mono text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                        Stack trace (dev only)
                      </summary>
                      <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-48 p-2 bg-black/50 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 min-w-[200px] gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 min-w-[200px] gap-2"
                >
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </div>

              {/* Conseils */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Que faire ?
                </h3>
                <ul className="text-sm text-gray-400 space-y-1.5">
                  <li>• Essayez de rafraîchir la page (F5)</li>
                  <li>• Videz le cache du navigateur (Ctrl+Shift+Delete)</li>
                  <li>• Vérifiez votre connexion internet</li>
                  <li>• Si le problème persiste, contactez le support</li>
                </ul>
              </div>

              {/* Support */}
              <div className="text-center text-sm text-gray-500">
                Besoin d'aide ?{' '}
                <a
                  href="mailto:support@trakerdart.app"
                  className="text-primary hover:underline"
                >
                  Contactez le support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC pour wrapper un composant avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
