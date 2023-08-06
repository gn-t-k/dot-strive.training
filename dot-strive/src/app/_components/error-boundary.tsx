"use client";

import React, { Component } from "react";

import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

type State =
  | {
      hasError: false;
    }
  | {
      hasError: true;
      error: Error;
    };

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section>
          <h1>エラーが発生しました</h1>
          <ul>
            <li>name: {this.state.error.name}</li>
            <li>message: {this.state.error.message}</li>
            <li>cause: {String(this.state.error.cause)}</li>
            <li>stack: {this.state.error.stack}</li>
          </ul>
        </section>
      );
    }

    return this.props.children;
  }
}
