import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    try {
      const { token, user: u } = await authApi.register(email, password, name);
      login(token, u);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
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
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>회원가입</h1>
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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>비밀번호 (6자 이상)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>이름 (선택)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.6rem' }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
