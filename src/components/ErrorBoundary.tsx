import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "var(--space-4)",
          maxWidth: "480px",
          margin: "var(--space-8) auto",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          <h1 style={{
            fontSize: "var(--font-title-sm-size)",
            color: "var(--text-primary)",
            marginBottom: "var(--space-2)",
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontSize: "var(--font-chip-mobile-size)",
            color: "var(--text-secondary)",
            marginBottom: "var(--space-3)",
            lineHeight: "1.6",
          }}>
            The app couldn't load. This is usually caused by browser storage
            (IndexedDB) being unavailable or corrupted — this can happen in
            private browsing mode or when storage is full.
          </p>
          {this.state.message && (
            <p style={{
              fontSize: "var(--font-chip-mobile-size)",
              color: "var(--color-danger)",
              marginBottom: "var(--space-3)",
              fontFamily: "monospace",
            }}>
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              height: "2.75rem",
              padding: "0 var(--space-3)",
              borderRadius: "var(--radius-input)",
              border: "1px solid var(--border-strong)",
              background: "var(--surface-base)",
              color: "var(--text-primary)",
              fontSize: "var(--font-chip-mobile-size)",
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;