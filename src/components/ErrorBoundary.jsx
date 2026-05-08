import React from 'react';

// Class component required — hooks cannot catch render errors.
// Wraps each page so a crash in one tab never takes down the whole app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface to console for debugging — no external logging needed (offline-first)
    console.error('[IronLog] Uncaught error in', this.props.name || 'page', error, info);
  }

  render() {
    if (this.state.error) {
      const c = this.props.c || {};
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '60vh', padding: '32px 24px',
          textAlign: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: c.text || '#f0f0ff' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: c.sub || '#48486e', maxWidth: 280, lineHeight: 1.6 }}>
            {this.props.name ? `The ${this.props.name} tab` : 'This page'} hit an
            unexpected error. Your workout data is safe in storage.
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              background: c.accent || '#7C6EFA', border: 'none', borderRadius: 12,
              padding: '12px 24px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', color: '#fff', fontFamily: 'inherit', marginTop: 8,
            }}
          >
            Try again
          </button>
          <details style={{ fontSize: 11, color: c.sub || '#48486e', maxWidth: 320, textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: 6 }}>Error details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: c.card2 || '#141422', padding: 12, borderRadius: 8 }}>
              {this.state.error.message}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
