import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <h1>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Scheduling App
          </Link>
        </h1>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <span style={{ color: '#ecf0f1' }}>Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
