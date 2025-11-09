import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export default function NewPoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([{ start_time: '', end_time: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addSlot = () => {
    setSlots([...slots, { start_time: '', end_time: '' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate slots
    const validSlots = slots.filter(s => s.start_time && s.end_time);
    if (validSlots.length === 0) {
      setError('Please add at least one complete time slot');
      return;
    }

    setLoading(true);

    try {
      const poll = await api.createPoll({
        title,
        description,
        slots: validSlots,
      });
      navigate(`/polls/${poll.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create New Poll</h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Poll Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Team Meeting Date"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the poll"
            />
          </div>

          <h3>Time Slots</h3>
          {slots.map((slot, index) => (
            <div key={index} className="slot-inputs">
              <h4>Slot {index + 1}</h4>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={slot.start_time}
                  onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={slot.end_time}
                  onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                />
              </div>
              {slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="btn btn-danger"
                  style={{ marginTop: '0.5rem' }}
                >
                  Remove Slot
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addSlot} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
            Add Another Slot
          </button>

          <div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginRight: '1rem' }}>
              {loading ? 'Creating...' : 'Create Poll'}
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
