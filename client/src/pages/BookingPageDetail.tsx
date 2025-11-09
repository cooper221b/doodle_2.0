import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { BookingPage } from '../types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BookingPageDetail() {
  const { id } = useParams<{ id: string }>();
  const [bookingPage, setBookingPage] = useState<BookingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookingPage();
  }, [id]);

  const loadBookingPage = async () => {
    try {
      const data = await api.getBookingPage(id!);
      setBookingPage(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (error || !bookingPage) {
    return (
      <div className="container">
        <div className="error">{error || 'Booking page not found'}</div>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <Link to="/dashboard" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>

        <h1>{bookingPage.name}</h1>
        {bookingPage.description && <p>{bookingPage.description}</p>}
        <p>
          <strong>Duration:</strong> {bookingPage.duration_minutes} minutes
        </p>
        <p>
          <strong>Timezone:</strong> {bookingPage.timezone}
        </p>

        <div className="public-url">
          Public URL: {window.location.origin}/book/{bookingPage.public_id}
        </div>

        <h2>Availability Rules</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time Range</th>
            </tr>
          </thead>
          <tbody>
            {bookingPage.availability.map((rule) => (
              <tr key={rule.id}>
                <td>{DAYS_OF_WEEK[rule.day_of_week]}</td>
                <td>
                  {rule.start_time_local} - {rule.end_time_local}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: '2rem' }}>Upcoming Bookings</h2>
        {!bookingPage.bookings || bookingPage.bookings.length === 0 ? (
          <div className="empty-state">No upcoming bookings</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {bookingPage.bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{new Date(booking.start_time).toLocaleString()}</td>
                  <td>{bookingPage.duration_minutes} min</td>
                  <td>{booking.invitee_name}</td>
                  <td>{booking.invitee_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
