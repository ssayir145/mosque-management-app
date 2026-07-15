import { NavLink, Outlet } from 'react-router-dom';
import { MosqueHeader } from '../shared/MosqueHeader';
import { useAuth } from '../../lib/auth/useAuth';

const tabs = [
  { to: '/resident', label: 'Dashboard', end: true },
  { to: '/resident/feedback', label: 'Feedback' },
  { to: '/resident/profile', label: 'Profile' },
];

export function ResidentLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen pb-16">
      <MosqueHeader>
        <button onClick={logout} className="btn-secondary bg-white/90 no-print" type="button">
          Logout
        </button>
      </MosqueHeader>
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <nav className="no-print -mt-5 flex gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-ink-100">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
                  isActive ? 'bg-sage-600 text-white' : 'text-ink-600 hover:bg-sage-50'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
