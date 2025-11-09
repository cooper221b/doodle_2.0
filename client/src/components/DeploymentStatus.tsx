import { useEffect, useState } from 'react';

export default function DeploymentStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const url = import.meta.env.VITE_API_URL || '/api';
    setApiUrl(url);

    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  if (backendStatus === 'checking') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: '#ffc107',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            Checking backend connection...
          </span>
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#f8d7da',
        border: '1px solid #f5c2c7',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '350px',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#dc3545',
              borderRadius: '50%'
            }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#721c24' }}>
              Backend Not Connected
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#721c24', margin: '0 0 8px 20px' }}>
            The app cannot connect to the backend API.
          </p>
          <details style={{ fontSize: '12px', color: '#721c24', marginLeft: '20px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              Troubleshooting Steps
            </summary>
            <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>
              <li>Deploy backend to Railway (see GITHUB_PAGES_DEPLOY.md)</li>
              <li>Set VITE_API_URL in GitHub repo settings</li>
              <li>Redeploy frontend from GitHub Actions</li>
            </ol>
            <p style={{ marginTop: '8px' }}>
              <strong>API URL:</strong> {apiUrl || 'Not configured'}
            </p>
          </details>
        </div>
        <button
          onClick={checkBackend}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: '20px'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Connected - show brief success message that fades away
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#d1e7dd',
      border: '1px solid #badbcc',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: '300px',
      zIndex: 1000,
      animation: 'fadeOut 3s forwards'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          background: '#198754',
          borderRadius: '50%'
        }} />
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f5132' }}>
          Backend Connected ✓
        </span>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}
