import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Poll } from '../types';

export default function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPoll();
  }, [id]);

  const loadPoll = async () => {
    try {
      const data = await api.getPoll(id!);
      setPoll(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  if (error || !poll) {
    return (
      <div className="container">
        <div className="error">{error || 'Poll not found'}</div>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Get unique participants
  const allResponses = poll.slots.flatMap(s => s.responses || []);
  const participants = [...new Set(allResponses.map(r => r.participant_name))];

  return (
    <div className="container">
      <div className="card">
        <Link to="/dashboard" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>

        <h1>{poll.title}</h1>
        {poll.description && <p>{poll.description}</p>}

        <div className="public-url">
          Public URL: {window.location.origin}/poll/{poll.public_id}
        </div>

        <h2>Results</h2>
        <p>Total participants: {participants.length}</p>

        <div className="response-table">
          <table>
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Yes</th>
                <th>No</th>
              </tr>
            </thead>
            <tbody>
              {poll.slots.map((slot) => (
                <tr key={slot.id}>
                  <td>
                    {new Date(slot.start_time).toLocaleString()} -{' '}
                    {new Date(slot.end_time).toLocaleTimeString()}
                  </td>
                  <td style={{ color: '#27ae60', fontWeight: 'bold' }}>{slot.yesCount || 0}</td>
                  <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{slot.noCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {participants.length > 0 && (
          <>
            <h3 style={{ marginTop: '2rem' }}>Detailed Responses</h3>
            <table>
              <thead>
                <tr>
                  <th>Participant</th>
                  {poll.slots.map((slot) => (
                    <th key={slot.id} style={{ fontSize: '0.8rem' }}>
                      {new Date(slot.start_time).toLocaleString('en', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant}>
                    <td>{participant}</td>
                    {poll.slots.map((slot) => {
                      const response = slot.responses?.find(r => r.participant_name === participant);
                      return (
                        <td key={slot.id} style={{ textAlign: 'center' }}>
                          {response?.choice === 'yes' ? '✓' : response?.choice === 'no' ? '✗' : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
