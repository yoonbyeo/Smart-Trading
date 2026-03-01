import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user: u } = await authApi.login(email, password);
      login(token, u);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        ← 홈으로
      </Link>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>로그인</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: 'var(--down)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.6rem' }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
