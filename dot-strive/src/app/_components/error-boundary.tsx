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
        <h1>Sorry.. there was an error: {JSON.stringify(this.state.error)}</h1>
      );
    }

    return this.props.children;
  }
}
