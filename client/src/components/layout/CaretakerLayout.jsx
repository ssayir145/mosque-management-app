import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth';

export function CaretakerLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-sage-50 pb-16">
      <header className="bg-sage-700 px-4 py-5 text-white shadow-md">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-sage-200">Caretaker</p>
            <h1 className="font-display text-xl font-bold">{profile?.full_name || 'Prayer Times'}</h1>
          </div>
          <button onClick={logout} className="btn-secondary bg-white/90 text-sm" type="button">
            Logout
          </button>
        </div>
        <nav className="mx-auto mt-4 flex max-w-xl gap-2">
          <NavLink
            to="/caretaker"
            end
            className={({ isActive }) =>
              `flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${
                isActive ? 'bg-white text-sage-700' : 'bg-sage-600 text-white hover:bg-sage-500'
              }`
            }
          >
            Today
          </NavLink>
          <NavLink
            to="/caretaker/schedule-ahead"
            className={({ isActive }) =>
              `flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${
                isActive ? 'bg-white text-sage-700' : 'bg-sage-600 text-white hover:bg-sage-500'
              }`
            }
          >
            Schedule Ahead
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
