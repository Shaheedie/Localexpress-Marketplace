import express from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireRole('seller', 'admin'), async (req, res, next) => {
  const db = await getDb();
  try {
    const sellerId = req.user.id;
    const shop = await db.get('SELECT * FROM shops WHERE user_id = ?', sellerId);
    const products = await db.all(`
      SELECT p.*, c.name AS category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, sellerId);
    const stats = {
      totalProducts: await db.get('SELECT COUNT(*) as value FROM products WHERE seller_id = ?', sellerId),
      activeProducts: await db.get('SELECT COUNT(*) as value FROM products WHERE seller_id = ? AND is_active = 1', sellerId),
      totalOrders: await db.get('SELECT COUNT(DISTINCT order_id) as value FROM order_items WHERE seller_id = ?', sellerId),
      revenue: await db.get('SELECT COALESCE(SUM(quantity * unit_price), 0) as value FROM order_items WHERE seller_id = ?', sellerId)
    };
    res.json({ shop, products, stats: Object.fromEntries(Object.entries(stats).map(([k,v]) => [k, v.value])) });
  } catch (error) { next(error); } finally { await db.close(); }
});

export default router;
