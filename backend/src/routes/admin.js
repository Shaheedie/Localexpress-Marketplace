import express from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole('admin'), async (req, res, next) => {
  const db = await getDb();
  try {
    const statsRows = {
      users: await db.get('SELECT COUNT(*) AS value FROM users'),
      sellers: await db.get("SELECT COUNT(*) AS value FROM users WHERE role='seller'"),
      products: await db.get('SELECT COUNT(*) AS value FROM products WHERE is_active = 1'),
      orders: await db.get('SELECT COUNT(*) AS value FROM orders'),
      revenue: await db.get('SELECT COALESCE(SUM(total_amount), 0) AS value FROM orders')
    };
    const users = await db.all('SELECT id, name, email, role, phone, town, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 50');
    const shops = await db.all(`
      SELECT s.*, u.name AS owner_name, u.email AS owner_email
      FROM shops s JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    const orders = await db.all(`
      SELECT o.*, u.name AS buyer_name
      FROM orders o JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC LIMIT 50
    `);
    res.json({
      stats: Object.fromEntries(Object.entries(statsRows).map(([k, v]) => [k, v.value])),
      users,
      shops,
      orders
    });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.put('/users/:id/toggle', requireAuth, requireRole('admin'), async (req, res, next) => {
  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Admin account cannot be disabled here.' });
    await db.run('UPDATE users SET is_active = ? WHERE id = ?', [user.is_active ? 0 : 1, req.params.id]);
    res.json({ message: user.is_active ? 'User disabled.' : 'User enabled.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.put('/shops/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'blocked'].includes(status)) return res.status(400).json({ message: 'Invalid shop status.' });
  const db = await getDb();
  try {
    await db.run('UPDATE shops SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Shop status updated.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

export default router;
