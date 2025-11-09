import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Scheduling App</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Create group availability polls or one-on-one booking pages
        </p>

        {user ? (
          <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem' }}>
            Go to Dashboard
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem' }}>
              Login
            </Link>
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'left', maxWidth: '800px', margin: '3rem auto 0' }}>
          <h2>Features</h2>
          <div className="grid grid-2" style={{ marginTop: '1rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Group Polls</h3>
              <p>Create Doodle-style polls to find the best time for group meetings</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Booking Pages</h3>
              <p>Set up Calendly-style booking pages for one-on-one appointments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
