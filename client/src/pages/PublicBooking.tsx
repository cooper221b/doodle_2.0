import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { BookingPage, TimeSlot } from '../types';

export default function PublicBooking() {
  const { publicId } = useParams<{ publicId: string }>();
  const [bookingPage, setBookingPage] = useState<BookingPage | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [inviteeName, setInviteeName] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadBookingPage();
  }, [publicId]);

  const loadBookingPage = async () => {
    try {
      const data = await api.getPublicBookingPage(publicId!);
      setBookingPage(data);
      await loadAvailableSlots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking page');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (page: BookingPage) => {
    setLoadingSlots(true);
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14); // 14 days forward

      const response = await api.getAvailableSlots(publicId!, {
        start_date: today.toISOString(),
        end_date: endDate.toISOString(),
      });
      setSlots(response.slots);
    } catch (err: any) {
      setError(err.message || 'Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setSubmitting(true);

    try {
      await api.createBooking(publicId!, {
        start_time: selectedSlot.start_time,
        invitee_name: inviteeName,
        invitee_email: inviteeEmail,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (error && !bookingPage) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!bookingPage) {
    return (
      <div className="container">
        <div className="error">Booking page not found</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div className="card">
          <div className="success">
            <h2>Booking Confirmed!</h2>
            <p>Your booking has been confirmed.</p>
            <p>
              <strong>Date & Time:</strong> {selectedSlot && new Date(selectedSlot.start_time).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {bookingPage.duration_minutes} minutes
            </p>
            <p>A confirmation will be sent to {inviteeEmail}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate: Record<string, TimeSlot[]> = {};
  slots.forEach((slot) => {
    const date = new Date(slot.start_time).toLocaleDateString();
    if (!slotsByDate[date]) {
      slotsByDate[date] = [];
    }
    slotsByDate[date].push(slot);
  });

  return (
    <div className="container">
      <div className="card">
        <h1>{bookingPage.name}</h1>
        {bookingPage.description && <p>{bookingPage.description}</p>}
        <p>
          <strong>Duration:</strong> {bookingPage.duration_minutes} minutes
        </p>

        {error && <div className="error">{error}</div>}

        {!selectedSlot ? (
          <>
            <h2>Select a Time</h2>
            {loadingSlots ? (
              <div className="loading">Loading available times...</div>
            ) : Object.keys(slotsByDate).length === 0 ? (
              <div className="empty-state">No available time slots in the next 14 days</div>
            ) : (
              <div className="calendar">
                {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                  <div key={date} className="calendar-day">
                    <h4>{date}</h4>
                    {dateSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="time-slot"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {new Date(slot.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Confirm Booking</h2>
            <div style={{ backgroundColor: '#e8f4f8', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <p>
                <strong>Selected Time:</strong>
              </p>
              <p>{new Date(selectedSlot.start_time).toLocaleString()}</p>
              <p>{bookingPage.duration_minutes} minutes</p>
              <button
                onClick={() => setSelectedSlot(null)}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
              >
                Choose Different Time
              </button>
            </div>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input
                  type="email"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
