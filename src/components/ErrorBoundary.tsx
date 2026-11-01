import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <h2>Une erreur est survenue</h2>
          <p>{this.state.error.message}</p>
          <button
            className="primary-button"
            onClick={() => this.setState({ error: null })}
          >
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
