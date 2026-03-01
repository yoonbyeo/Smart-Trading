import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
    ).run(email.toLowerCase(), hash, name || null);

    const token = jwt.sign(
      { userId: result.lastInsertRowid },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, email: email.toLowerCase(), name: name || null }
    });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
    }
    res.status(500).json({ error: '회원가입에 실패했습니다.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch {
    res.status(500).json({ error: '로그인에 실패했습니다.' });
  }
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
      .get(decoded.userId);
    if (!user) return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    res.json(user);
  } catch {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

export default router;
