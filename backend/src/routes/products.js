import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getDb } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomUUID()}${safeExt}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowed.has(file.mimetype)) return cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'));
    cb(null, true);
  }
});

router.get('/categories', async (req, res, next) => {
  const db = await getDb();
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    res.json({ categories });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.get('/', async (req, res, next) => {
  const { search = '', category = '', seller = '', limit = 60 } = req.query;
  const safeLimit = Math.min(Math.max(Number(limit) || 60, 1), 100);
  const db = await getDb();
  try {
    const params = [];
    let where = 'WHERE p.is_active = 1 AND u.is_active = 1';
    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }
    if (seller) {
      where += ' AND p.seller_id = ?';
      params.push(Number(seller));
    }
    params.push(safeLimit);
    const products = await db.all(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug, u.name AS seller_name, s.shop_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN shops s ON s.user_id = u.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ?
    `, params);
    res.json({ products });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.get('/:id', async (req, res, next) => {
  const db = await getDb();
  try {
    const product = await db.get(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug, u.name AS seller_name, s.shop_name, s.town AS shop_town
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN shops s ON s.user_id = u.id
      WHERE p.id = ? AND p.is_active = 1
    `, req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.post('/', requireAuth, requireRole('seller', 'admin'), upload.single('image'), async (req, res, next) => {
  const { name, description, price, stock, category_id, image_url } = req.body;
  const numericPrice = Number(price);
  const numericStock = Number(stock || 0);
  if (!String(name || '').trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ message: 'Product name and a valid price greater than zero are required.' });
  }
  if (!Number.isInteger(numericStock) || numericStock < 0) {
    return res.status(400).json({ message: 'Stock must be a non-negative whole number.' });
  }
  const db = await getDb();
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : image_url || '';
    const result = await db.run(
      `INSERT INTO products (seller_id, category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id || null, String(name).trim(), description || '', numericPrice, numericStock, fileUrl]
    );
    const product = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
    res.status(201).json({ product, message: 'Product added successfully.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.put('/:id', requireAuth, requireRole('seller', 'admin'), upload.single('image'), async (req, res, next) => {
  const { name, description, price, stock, category_id, image_url, is_active } = req.body;
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
    return res.status(400).json({ message: 'Price must be greater than zero.' });
  }
  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    return res.status(400).json({ message: 'Stock must be a non-negative whole number.' });
  }
  const db = await getDb();
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own products.' });
    }
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : (image_url ?? product.image_url);
    await db.run(
      `UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, image_url=?, is_active=? WHERE id=?`,
      [category_id || product.category_id, name || product.name, description ?? product.description, Number(price ?? product.price), Number(stock ?? product.stock), fileUrl, Number(is_active ?? product.is_active), req.params.id]
    );
    const updated = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    res.json({ product: updated, message: 'Product updated successfully.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

router.delete('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res, next) => {
  const db = await getDb();
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (req.user.role !== 'admin' && product.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only remove your own products.' });
    }
    await db.run('UPDATE products SET is_active = 0 WHERE id = ?', req.params.id);
    res.json({ message: 'Product removed from public listing.' });
  } catch (error) { next(error); } finally { await db.close(); }
});

export default router;
