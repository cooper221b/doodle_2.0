import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface AvailabilityRule {
  day_of_week: number;
  start_time_local: string;
  end_time_local: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function NewBookingPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [timezone, setTimezone] = useState('America/New_York');
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([
    { day_of_week: 1, start_time_local: '09:00', end_time_local: '17:00' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addRule = () => {
    setAvailabilityRules([
      ...availabilityRules,
      { day_of_week: 1, start_time_local: '09:00', end_time_local: '17:00' },
    ]);
  };

  const removeRule = (index: number) => {
    setAvailabilityRules(availabilityRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof AvailabilityRule, value: any) => {
    const newRules = [...availabilityRules];
    newRules[index][field] = value;
    setAvailabilityRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (availabilityRules.length === 0) {
      setError('Please add at least one availability rule');
      return;
    }

    setLoading(true);

    try {
      const bookingPage = await api.createBookingPage({
        name,
        description,
        duration_minutes: durationMinutes,
        timezone,
        availability_rules: availabilityRules,
      });
      navigate(`/booking-pages/${bookingPage.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create New Booking Page</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Booking Page Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., 30-Minute Consultation"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              required
              min="15"
              step="15"
            />
          </div>

          <div className="form-group">
            <label>Timezone *</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} required>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <h3>Availability Rules</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Define when you're available for bookings each week.
          </p>

          {availabilityRules.map((rule, index) => (
            <div key={index} className="availability-day">
              <h4>Rule {index + 1}</h4>
              <div className="form-group">
                <label>Day of Week</label>
                <select
                  value={rule.day_of_week}
                  onChange={(e) => updateRule(index, 'day_of_week', parseInt(e.target.value))}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={rule.start_time_local}
                  onChange={(e) => updateRule(index, 'start_time_local', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={rule.end_time_local}
                  onChange={(e) => updateRule(index, 'end_time_local', e.target.value)}
                />
              </div>
              {availabilityRules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="btn btn-danger"
                  style={{ marginTop: '0.5rem' }}
                >
                  Remove Rule
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addRule} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
            Add Another Rule
          </button>

          <div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginRight: '1rem' }}>
              {loading ? 'Creating...' : 'Create Booking Page'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
