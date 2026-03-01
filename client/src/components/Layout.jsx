import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, fontSize: '1.25rem' }}>
          Stock Analyzer
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>대시보드</Link>
          <Link to="/search" style={{ color: 'var(--text-secondary)' }}>검색</Link>
          <Link to="/portfolio" style={{ color: 'var(--text-secondary)' }}>포트폴리오</Link>
          {user ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-muted text-sm">{user.email}</span>
              <button onClick={handleLogout} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                로그아웃
              </button>
            </span>
          ) : (
            <Link to="/login">
              <button>로그인</button>
            </Link>
          )}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
