import express from 'express';
import { getDb } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

async function getOrderDetails(db, orderId) {
  const order = await db.get(`
    SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
    FROM orders o
    JOIN users u ON o.buyer_id = u.id
    WHERE o.id = ?
  `, orderId);
  const items = await db.all(`
    SELECT oi.*, p.name AS product_name, p.image_url, s.name AS seller_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN users s ON oi.seller_id = s.id
    WHERE oi.order_id = ?
  `, orderId);
  return { ...order, items };
}

router.post('/', requireAuth, requireRole('buyer', 'seller', 'admin'), async (req, res, next) => {
  const { items, delivery_type = 'delivery', delivery_address, phone, payment_method = 'cash_on_delivery', notes } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required.' });
  }

  const db = await getDb();
  try {
    await db.exec('BEGIN TRANSACTION');
    let total = 0;
    const prepared = [];

    for (const item of items) {
      const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} was not found.`);
      const quantity = Number(item.quantity || 1);
      if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Quantity must be a positive whole number.');
      if (product.stock < quantity) throw new Error(`${product.name} only has ${product.stock} item(s) left.`);
      total += product.price * quantity;
      prepared.push({ product, quantity });
    }

    const orderResult = await db.run(
      `INSERT INTO orders (buyer_id, total_amount, delivery_type, delivery_address, phone, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, total, delivery_type, delivery_address || '', phone || '', payment_method, notes || '']
    );

    for (const item of prepared) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
        [orderResult.lastID, item.product.id, item.product.seller_id, item.quantity, item.product.price]
      );
      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product.id]);
    }

    await db.exec('COMMIT');
    const order = await getOrderDetails(db, orderResult.lastID);
    res.status(201).json({ order, message: 'Order placed successfully.' });
  } catch (error) {
    await db.exec('ROLLBACK');
    next(error);
  } finally {
    await db.close();
  }
});

router.get('/my-orders', requireAuth, async (req, res, next) => {
  const db = await getDb();
  try {
    const orders = await db.all('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC', req.user.id);
    for (const order of orders) {
      order.items = await db.all(`
        SELECT oi.*, p.name AS product_name, p.image_url
        FROM order_items oi JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, order.id);
    }
    res.json({ orders });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.get('/seller', requireAuth, requireRole('seller', 'admin'), async (req, res, next) => {
  const db = await getDb();
  try {
    const sellerCondition = req.user.role === 'admin' ? '' : 'WHERE oi.seller_id = ?';
    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const rows = await db.all(`
      SELECT oi.*, o.status, o.payment_method, o.delivery_type, o.delivery_address, o.phone, o.created_at,
             u.name AS buyer_name, p.name AS product_name, p.image_url
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.buyer_id = u.id
      JOIN products p ON oi.product_id = p.id
      ${sellerCondition}
      ORDER BY o.created_at DESC
    `, params);
    res.json({ orderItems: rows });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.put('/:id/status', requireAuth, requireRole('seller', 'admin'), async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'out_for_delivery', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid order status.' });
  const db = await getDb();
  try {
    if (req.user.role === 'seller') {
      const item = await db.get('SELECT id FROM order_items WHERE order_id = ? AND seller_id = ?', [req.params.id, req.user.id]);
      if (!item) return res.status(403).json({ message: 'This order does not belong to your shop.' });
    }
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const order = await getOrderDetails(db, req.params.id);
    res.json({ order, message: 'Order status updated.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  const db = await getDb();
  try {
    const order = await getOrderDetails(db, req.params.id);
    if (!order.id) return res.status(404).json({ message: 'Order not found.' });
    const isOwner = order.buyer_id === req.user.id;
    const hasSellerItem = await db.get('SELECT id FROM order_items WHERE order_id = ? AND seller_id = ?', [req.params.id, req.user.id]);
    if (req.user.role !== 'admin' && !isOwner && !hasSellerItem) return res.status(403).json({ message: 'You cannot view this order.' });
    res.json({ order });
  } catch (error) { next(error); } finally { await db.close(); }
});

export default router;
