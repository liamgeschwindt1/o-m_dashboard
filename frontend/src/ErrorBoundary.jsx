import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App error boundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        padding: 32,
        background: "#031119",
        color: "#F7F7F7",
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
      }}>
        <h1 style={{ color: "#FF7230", marginTop: 0 }}>Something went wrong</h1>
        <pre style={{
          background: "rgba(255,255,255,0.05)",
          padding: 16,
          borderRadius: 8,
          fontSize: 12,
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}>
          {String(this.state.error?.stack ?? this.state.error)}
        </pre>
        {this.state.info?.componentStack && (
          <pre style={{
            background: "rgba(255,255,255,0.05)",
            padding: 16,
            borderRadius: 8,
            fontSize: 11,
            overflow: "auto",
            color: "rgba(247,247,247,0.55)",
            marginTop: 12,
          }}>
            {this.state.info.componentStack}
          </pre>
        )}
      </div>
    );
  }
}
