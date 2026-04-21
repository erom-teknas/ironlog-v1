import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useRegisterSW } from 'virtual:pwa-register/react';
import App, { ErrorBoundary } from './App.jsx';

/* global __BUILD_TIME__ */
const BUILD_TIME = __BUILD_TIME__;
const LS_KEY = 'il_build';

function Root() {
  const { needRefresh: [swNeedsRefresh], updateServiceWorker } = useRegisterSW();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    // Show banner if user has visited before and build changed
    if (stored && stored !== BUILD_TIME) {
      setShowBanner(true);
    }
    localStorage.setItem(LS_KEY, BUILD_TIME);
  }, []);

  // Also show if SW detected an update (belt-and-suspenders)
  useEffect(() => {
    if (swNeedsRefresh) setShowBanner(true);
  }, [swNeedsRefresh]);

  const doUpdate = () => {
    updateServiceWorker(true);
    // Fallback: hard reload after short delay if SW doesn't trigger controllerchange
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      {showBanner && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, background: '#7C6EFA', color: '#fff', borderRadius: 14,
          padding: '12px 20px', fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 32px)',
        }}>
          🆕 Update available
          <button onClick={doUpdate} style={{
            background: '#fff', color: '#7C6EFA', border: 'none',
            borderRadius: 9, padding: '5px 12px', fontSize: 13,
            fontWeight: 800, cursor: 'pointer',
          }}>Refresh</button>
          <button onClick={() => setShowBanner(false)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
          }}>×</button>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
