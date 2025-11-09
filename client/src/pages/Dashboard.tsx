import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Poll, BookingPage } from '../types';

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [bookingPages, setBookingPages] = useState<BookingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pollsData, bookingPagesData] = await Promise.all([
        api.getPolls(),
        api.getBookingPages(),
      ]);
      setPolls(pollsData);
      setBookingPages(bookingPagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Polls</h2>
          <Link to="/polls/new" className="btn btn-primary">
            Create New Poll
          </Link>
        </div>

        {polls.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any polls yet.</p>
          </div>
        ) : (
          <ul className="poll-list">
            {polls.map((poll) => (
              <li key={poll.id} className="poll-item">
                <h3>
                  <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
                </h3>
                {poll.description && <p>{poll.description}</p>}
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Created {new Date(poll.created_at).toLocaleDateString()} • {poll.slots?.length || 0} slots
                </p>
                <div className="public-url">
                  Public URL: {window.location.origin}/poll/{poll.public_id}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>My Booking Pages</h2>
          <Link to="/booking-pages/new" className="btn btn-primary">
            Create New Booking Page
          </Link>
        </div>

        {bookingPages.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any booking pages yet.</p>
          </div>
        ) : (
          <ul className="booking-page-list">
            {bookingPages.map((page) => (
              <li key={page.id} className="booking-page-item">
                <h3>
                  <Link to={`/booking-pages/${page.id}`}>{page.name}</Link>
                </h3>
                {page.description && <p>{page.description}</p>}
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  {page.duration_minutes} minutes • {page.timezone}
                </p>
                <div className="public-url">
                  Public URL: {window.location.origin}/book/{page.public_id}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
