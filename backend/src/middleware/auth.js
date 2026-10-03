import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

export async function attachCurrentUser(req, res, next) {
  if (!req.user) return next();
  const db = await getDb();
  try {
    const user = await db.get('SELECT id, name, email, role, phone, address, town, is_active, created_at FROM users WHERE id = ?', req.user.id);
    if (!user || !user.is_active) return res.status(401).json({ message: 'Account not found or disabled.' });
    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  } finally {
    await db.close();
  }
}
