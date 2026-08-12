import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function AddDreamPage() {
  const { token, user, logout } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLucid, setIsLucid] = useState(false);
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          isLucid,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');

      setSuccess(true);
      setTitle('');
      setDescription('');
      setIsLucid(false);
      setTags('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="top-bar">
        <h1>Add a dream</h1>
        <span className="logout-link" onClick={logout}>
          Log out {user ? `(${user.email})` : ''}
        </span>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Tags (comma separated)
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isLucid}
            onChange={(e) => setIsLucid(e.target.checked)}
          />
          This was a lucid dream
        </label>
        {error && <span className="error">{error}</span>}
        {success && <span className="success">Dream saved.</span>}
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save dream'}
        </button>
      </form>
    </div>
  );
}
