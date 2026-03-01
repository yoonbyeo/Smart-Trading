import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
        background: '#0d1422',
        borderBottom: '1px solid #1f2d45',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
          <NavLink to="/" style={{ fontSize: 18, fontWeight: 700, color: '#60a5fa', textDecoration: 'none' }}>
            📈 Smart Trading
          </NavLink>
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {[
              { to: '/', label: '대시보드' },
              { to: '/search', label: '종목 검색' },
              { to: '/portfolio', label: '포트폴리오' }
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 8,
                color: isActive ? '#60a5fa' : '#94a3b8',
                background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.15s'
              })}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{user.name || user.email}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">로그아웃</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>로그인</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>회원가입</NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid #1f2d45', padding: '20px 24px', textAlign: 'center', color: '#475569', fontSize: 12 }}>
        Smart Trading · 투자는 본인 책임입니다 · 참고용 정보만 제공
      </footer>
    </div>
  );
}
