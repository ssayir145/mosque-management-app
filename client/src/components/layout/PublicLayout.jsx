import { Link, Outlet } from 'react-router-dom';
import { MosqueHeader } from '../shared/MosqueHeader';

export function PublicLayout() {
  return (
    <div className="min-h-screen pb-16">
      <MosqueHeader>
        <Link to="/login/resident" className="btn-gold no-print">
          Resident Login
        </Link>
      </MosqueHeader>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-sage-100 py-6 text-center text-xs text-ink-400">
        <p>Built with care for the community · Baarak Allaahu Feekum</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link to="/login/admin" className="hover:text-sage-600">
            Admin
          </Link>
          <Link to="/login/caretaker" className="hover:text-sage-600">
            Caretaker
          </Link>
        </div>
      </footer>
    </div>
  );
}
