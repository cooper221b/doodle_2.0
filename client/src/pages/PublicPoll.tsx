import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Poll } from '../types';

export default function PublicPoll() {
  const { publicId } = useParams<{ publicId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPoll();
  }, [publicId]);

  const loadPoll = async () => {
    try {
      const data = await api.getPublicPoll(publicId!);
      setPoll(data);

      // Initialize responses with default "no"
      const initialResponses: Record<string, string> = {};
      data.slots.forEach((slot: any) => {
        initialResponses[slot.id] = 'no';
      });
      setResponses(initialResponses);
    } catch (err: any) {
      setError(err.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);

    try {
      const responsesArray = Object.entries(responses).map(([slot_id, choice]) => ({
        slot_id,
        choice,
      }));

      await api.submitPollResponses(publicId!, {
        participant_name: participantName,
        responses: responsesArray,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (error && !poll) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container">
        <div className="error">Poll not found</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div className="card">
          <div className="success">
            <h2>Thank you!</h2>
            <p>Your responses have been recorded.</p>
          </div>
          <button onClick={() => setSuccess(false)} className="btn btn-primary">
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{poll.title}</h1>
        {poll.description && <p>{poll.description}</p>}

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

          <h3>Select your availability</h3>
          <table>
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Available?</th>
              </tr>
            </thead>
            <tbody>
              {poll.slots.map((slot) => (
                <tr key={slot.id}>
                  <td>
                    {new Date(slot.start_time).toLocaleString()} -{' '}
                    {new Date(slot.end_time).toLocaleTimeString()}
                  </td>
                  <td>
                    <div className="response-choice">
                      <label>
                        <input
                          type="radio"
                          name={`slot-${slot.id}`}
                          value="yes"
                          checked={responses[slot.id] === 'yes'}
                          onChange={() => setResponses({ ...responses, [slot.id]: 'yes' })}
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`slot-${slot.id}`}
                          value="no"
                          checked={responses[slot.id] === 'no'}
                          onChange={() => setResponses({ ...responses, [slot.id]: 'no' })}
                        />
                        No
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="submit" className="btn btn-success" disabled={submitting} style={{ marginTop: '1rem' }}>
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
}
