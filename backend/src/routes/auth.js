import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { requireAuth, attachCurrentUser } from '../middleware/auth.js';
import { config } from '../config.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

router.post('/register', async (req, res, next) => {
  const { name, email, password, role = 'buyer', phone, address, town, shopName, shopDescription } = req.body;
  const normalizedName = String(name || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }
  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ message: 'You can only register as buyer or seller.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const db = await getDb();
  try {
    const exists = await db.get('SELECT id FROM users WHERE email = ?', normalizedEmail);
    if (exists) return res.status(409).json({ message: 'Email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, phone, address, town) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [normalizedName, normalizedEmail, passwordHash, role, phone || '', address || '', town || 'Local Town']
    );

    if (role === 'seller') {
      await db.run(
        `INSERT INTO shops (user_id, shop_name, description, town, status) VALUES (?, ?, ?, ?, ?)`,
        [result.lastID, shopName || `${normalizedName}'s Shop`, shopDescription || 'Local seller shop', town || 'Local Town', 'approved']
      );
    }

    const user = await db.get('SELECT id, name, email, role, phone, address, town, created_at FROM users WHERE id = ?', result.lastID);
    res.status(201).json({ user, token: createToken(user), message: 'Account created successfully.' });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', normalizedEmail);
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.is_active) return res.status(403).json({ message: 'This account has been disabled.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    res.json({ user: sanitizeUser(user), token: createToken(user), message: 'Login successful.' });
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
});

router.get('/me', requireAuth, attachCurrentUser, (req, res) => {
  res.json({ user: req.currentUser });
});

export default router;
