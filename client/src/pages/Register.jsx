import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { email, password, name });
      login(data);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>회원가입</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>무료로 시작하세요</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>이름 (선택)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'var(--text2)', fontSize: 13 }}>비밀번호 (6자 이상)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text2)', fontSize: 13 }}>
          이미 계정이 있으신가요? <Link to="/login" style={{ color: 'var(--accent2)' }}>로그인</Link>
        </p>
      </div>
    </div>
  );
}
