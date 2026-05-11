import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: 16,
            fontFamily: "sans-serif",
          }}
        >
          <p style={{ fontSize: 20, margin: 0 }}>앗, 오류가 발생했어요 😅</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 28px",
              borderRadius: 14,
              background: "#f472b6",
              color: "#fff",
              border: "none",
              fontSize: 16,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            처음으로 돌아가기
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
