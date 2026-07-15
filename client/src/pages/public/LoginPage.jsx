import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';

const ROLE_CONFIG = {
  resident: {
    label: 'Resident',
    identifierLabel: 'Phone Number',
    identifierType: 'tel',
    identifierField: 'phone',
    placeholder: '+15550001111',
    home: '/resident',
  },
  admin: {
    label: 'Admin',
    identifierLabel: 'Email',
    identifierType: 'email',
    identifierField: 'email',
    placeholder: 'admin@mosque.local',
    home: '/admin',
  },
  caretaker: {
    label: 'Caretaker',
    identifierLabel: 'Email',
    identifierType: 'email',
    identifierField: 'email',
    placeholder: 'caretaker@mosque.local',
    home: '/caretaker',
  },
};

export default function LoginPage() {
  const { role: routeRole } = useParams();
  const role = ROLE_CONFIG[routeRole] ? routeRole : 'resident';
  const config = ROLE_CONFIG[role];
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(role, { [config.identifierField]: identifier, password });
      navigate(config.home, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <Link
            key={key}
            to={`/login/${key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
              key === role ? 'bg-sage-600 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-sage-50'
            }`}
          >
            {cfg.label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card geo-border space-y-4 p-6 sm:p-8">
        <h2 className="text-center font-display text-2xl font-bold text-ink-900">{config.label} Login</h2>
        <div>
          <label className="label">{config.identifierLabel}</label>
          <input
            className="input"
            type={config.identifierType}
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={config.placeholder}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-xs text-ink-400">
          <Link to="/" className="hover:text-sage-600">
            ← Back to home
          </Link>
        </p>
      </form>
    </div>
  );
}
