import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';

const links = [
  { to: '/admin', label: 'Overview', end: true, icon: '📊' },
  { to: '/admin/payments', label: 'Payments', icon: '💳' },
  { to: '/admin/households', label: 'Residents', icon: '🏠' },
  { to: '/admin/announcements', label: 'Announcements', icon: '📣' },
  { to: '/admin/reminders', label: 'Reminders', icon: '💬' },
  { to: '/admin/reports', label: 'Reports', icon: '🧾' },
  { to: '/admin/feedback', label: 'Feedback', icon: '✉️' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export function AdminLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-sage-100 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-sage-100 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-xl">🕌</div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-ink-900">Admin</p>
            <p className="truncate text-xs text-ink-400">{profile?.full_name || profile?.email}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-sage-600 text-white shadow-sm' : 'text-ink-600 hover:bg-sage-50'
                }`
              }
            >
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sage-100 p-3">
          <button onClick={logout} className="btn-secondary w-full" type="button">
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="no-print flex items-center justify-between border-b border-sage-100 bg-white px-4 py-3 lg:hidden">
          <p className="font-display text-lg font-bold text-ink-900">🕌 Admin</p>
          <button onClick={logout} className="btn-secondary text-sm" type="button">
            Logout
          </button>
        </div>
        <div className="no-print flex gap-1 overflow-x-auto border-b border-sage-100 bg-white px-2 py-2 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-sage-600 text-white' : 'bg-sage-50 text-ink-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
