import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'database');
const dbPath = path.join(dataDir, 'localexpress-data.json');

let data = null;
let transactionSnapshot = null;

const emptyData = () => ({
  users: [],
  shops: [],
  categories: [],
  products: [],
  orders: [],
  order_items: [],
  reviews: [],
  counters: {
    users: 0,
    shops: 0,
    categories: 0,
    products: 0,
    orders: 0,
    order_items: 0,
    reviews: 0
  }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

function normalizeParams(params) {
  if (params === undefined) return [];
  return Array.isArray(params) ? params : [params];
}

function normalizeSql(sql) {
  return String(sql).replace(/\s+/g, ' ').trim().toLowerCase();
}

async function ensureLoaded() {
  await fs.mkdir(dataDir, { recursive: true });
  if (data) return;
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    data = JSON.parse(raw);
  } catch {
    data = emptyData();
    await saveData();
  }
}

async function saveData() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

function nextId(table) {
  data.counters[table] = (data.counters[table] || 0) + 1;
  return data.counters[table];
}

function publicUser(user) {
  if (!user) return undefined;
  const { password_hash, ...safe } = user;
  return { ...safe };
}

function categoryById(id) {
  return data.categories.find((c) => Number(c.id) === Number(id));
}

function categoryBySlug(slug) {
  return data.categories.find((c) => c.slug === slug);
}

function userById(id) {
  return data.users.find((u) => Number(u.id) === Number(id));
}

function shopByUserId(userId) {
  return data.shops.find((s) => Number(s.user_id) === Number(userId));
}

function productById(id) {
  return data.products.find((p) => Number(p.id) === Number(id));
}

function decorateProduct(product) {
  if (!product) return undefined;
  const category = categoryById(product.category_id);
  const seller = userById(product.seller_id);
  const shop = shopByUserId(product.seller_id);
  return {
    ...product,
    category_name: category?.name || null,
    category_slug: category?.slug || null,
    seller_name: seller?.name || null,
    shop_name: shop?.shop_name || null,
    shop_town: shop?.town || null
  };
}

function decorateOrder(order) {
  if (!order) return undefined;
  const buyer = userById(order.buyer_id);
  return {
    ...order,
    buyer_name: buyer?.name || null,
    buyer_email: buyer?.email || null
  };
}

function decorateOrderItem(item, includeOrder = false) {
  if (!item) return undefined;
  const product = productById(item.product_id);
  const seller = userById(item.seller_id);
  const order = data.orders.find((o) => Number(o.id) === Number(item.order_id));
  const buyer = order ? userById(order.buyer_id) : null;

  return {
    ...item,
    product_name: product?.name || null,
    image_url: product?.image_url || null,
    seller_name: seller?.name || null,
    ...(includeOrder && order ? {
      status: order.status,
      payment_method: order.payment_method,
      delivery_type: order.delivery_type,
      delivery_address: order.delivery_address,
      phone: order.phone,
      created_at: order.created_at,
      buyer_name: buyer?.name || null
    } : {})
  };
}

function sortNewest(items) {
  return [...items].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

class LocalJsonDb {
  async get(sql, params) {
    await ensureLoaded();
    const q = normalizeSql(sql);
    const p = normalizeParams(params);

    if (q === 'select count(*) as count from users') return { count: data.users.length };
    if (q === 'select count(*) as value from users') return { value: data.users.length };
    if (q.includes("select count(*) as value from users where role='seller'")) return { value: data.users.filter((u) => u.role === 'seller').length };
    if (q === 'select count(*) as value from products where is_active = 1') return { value: data.products.filter((x) => Number(x.is_active) === 1).length };
    if (q === 'select count(*) as value from orders') return { value: data.orders.length };
    if (q === 'select coalesce(sum(total_amount), 0) as value from orders') {
      return { value: data.orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) };
    }

    if (q === 'select id from users where email = ?') {
      const user = data.users.find((u) => u.email === String(p[0]).toLowerCase());
      return user ? { id: user.id } : undefined;
    }
    if (q === 'select * from users where email = ?') {
      return data.users.find((u) => u.email === String(p[0]).toLowerCase());
    }
    if (q === 'select * from users where id = ?') {
      return data.users.find((u) => Number(u.id) === Number(p[0]));
    }
    if (q.startsWith('select id, name, email, role, phone, address, town') && q.includes('from users where id = ?')) {
      return publicUser(userById(p[0]));
    }

    if (q === 'select * from products where id = ?') return productById(p[0]);
    if (q === 'select * from products where id = ? and is_active = 1') {
      const product = productById(p[0]);
      return product && Number(product.is_active) === 1 ? product : undefined;
    }
    if (q.includes('from products p') && q.includes('where p.id = ? and p.is_active = 1')) {
      const product = productById(p[0]);
      return product && Number(product.is_active) === 1 ? decorateProduct(product) : undefined;
    }

    if (q.includes('from orders o') && q.includes('join users u') && q.includes('where o.id = ?')) {
      const order = data.orders.find((o) => Number(o.id) === Number(p[0]));
      return decorateOrder(order);
    }
    if (q === 'select id from order_items where order_id = ? and seller_id = ?') {
      const item = data.order_items.find((oi) => Number(oi.order_id) === Number(p[0]) && Number(oi.seller_id) === Number(p[1]));
      return item ? { id: item.id } : undefined;
    }

    if (q === 'select * from shops where user_id = ?') {
      return shopByUserId(p[0]);
    }

    if (q === 'select count(*) as value from products where seller_id = ?') {
      return { value: data.products.filter((x) => Number(x.seller_id) === Number(p[0])).length };
    }
    if (q === 'select count(*) as value from products where seller_id = ? and is_active = 1') {
      return { value: data.products.filter((x) => Number(x.seller_id) === Number(p[0]) && Number(x.is_active) === 1).length };
    }
    if (q === 'select count(distinct order_id) as value from order_items where seller_id = ?') {
      return { value: new Set(data.order_items.filter((x) => Number(x.seller_id) === Number(p[0])).map((x) => x.order_id)).size };
    }
    if (q === 'select coalesce(sum(quantity * unit_price), 0) as value from order_items where seller_id = ?') {
      return {
        value: data.order_items
          .filter((x) => Number(x.seller_id) === Number(p[0]))
          .reduce((sum, x) => sum + Number(x.quantity || 0) * Number(x.unit_price || 0), 0)
      };
    }

    throw new Error(`Unsupported database read query: ${sql}`);
  }

  async all(sql, params) {
    await ensureLoaded();
    const q = normalizeSql(sql);
    const p = normalizeParams(params);

    if (q === 'select * from categories order by name asc') {
      return [...data.categories].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (q.includes('from products p') && q.includes('join users u on p.seller_id = u.id') && q.includes('limit ?')) {
      let index = 0;
      let products = data.products.filter((product) => {
        const seller = userById(product.seller_id);
        return Number(product.is_active) === 1 && seller && Number(seller.is_active) === 1;
      });

      if (q.includes('(p.name like ? or p.description like ?)')) {
        const term = String(p[index] || '').replace(/%/g, '').toLowerCase();
        index += 2;
        products = products.filter((product) =>
          product.name.toLowerCase().includes(term) || String(product.description || '').toLowerCase().includes(term)
        );
      }
      if (q.includes('c.slug = ?')) {
        const slug = p[index++];
        const category = categoryBySlug(slug);
        products = products.filter((product) => Number(product.category_id) === Number(category?.id));
      }
      if (q.includes('p.seller_id = ?')) {
        const sellerId = p[index++];
        products = products.filter((product) => Number(product.seller_id) === Number(sellerId));
      }
      const limit = Number(p[p.length - 1] || 60);
      return sortNewest(products).slice(0, limit).map(decorateProduct);
    }

    if (q === 'select * from orders where buyer_id = ? order by created_at desc') {
      return sortNewest(data.orders.filter((order) => Number(order.buyer_id) === Number(p[0]))).map((order) => ({ ...order }));
    }

    if (q.includes('from order_items oi join products p') && q.includes('where oi.order_id = ?')) {
      return data.order_items
        .filter((item) => Number(item.order_id) === Number(p[0]))
        .map((item) => decorateOrderItem(item));
    }

    if (q.includes('from order_items oi') && q.includes('join orders o') && q.includes('join products p')) {
      let items = data.order_items;
      if (q.includes('where oi.seller_id = ?')) {
        items = items.filter((item) => Number(item.seller_id) === Number(p[0]));
      }
      return sortNewest(items.map((item) => decorateOrderItem(item, true)));
    }

    if (q.includes('from products p left join categories c') && q.includes('where p.seller_id = ?')) {
      return sortNewest(data.products.filter((product) => Number(product.seller_id) === Number(p[0]))).map(decorateProduct);
    }

    if (q === 'select id, name, email, role, phone, town, is_active, created_at from users order by created_at desc limit 50') {
      return sortNewest(data.users).slice(0, 50).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        town: u.town,
        is_active: u.is_active,
        created_at: u.created_at
      }));
    }

    if (q.includes('from shops s join users u on s.user_id = u.id')) {
      return sortNewest(data.shops).map((shop) => {
        const owner = userById(shop.user_id);
        return { ...shop, owner_name: owner?.name || null, owner_email: owner?.email || null };
      });
    }

    if (q.includes('from orders o join users u on o.buyer_id = u.id')) {
      return sortNewest(data.orders).slice(0, 50).map(decorateOrder);
    }

    throw new Error(`Unsupported database list query: ${sql}`);
  }

  async run(sql, params) {
    await ensureLoaded();
    const q = normalizeSql(sql);
    const p = normalizeParams(params);
    let lastID = null;
    let changes = 0;

    if (q.startsWith('insert into users')) {
      lastID = nextId('users');
      data.users.push({
        id: lastID,
        name: p[0],
        email: String(p[1]).toLowerCase(),
        password_hash: p[2],
        role: p[3] || 'buyer',
        phone: p[4] || '',
        address: p[5] || '',
        town: p[6] || 'Local Town',
        is_active: 1,
        created_at: now()
      });
      changes = 1;
    } else if (q.startsWith('insert into shops')) {
      lastID = nextId('shops');
      data.shops.push({
        id: lastID,
        user_id: Number(p[0]),
        shop_name: p[1],
        description: p[2] || '',
        town: p[3] || 'Local Town',
        status: p[4] || 'approved',
        created_at: now()
      });
      changes = 1;
    } else if (q.startsWith('insert into categories')) {
      lastID = nextId('categories');
      data.categories.push({ id: lastID, name: p[0], slug: p[1] });
      changes = 1;
    } else if (q.startsWith('insert into products')) {
      lastID = nextId('products');
      data.products.push({
        id: lastID,
        seller_id: Number(p[0]),
        category_id: p[1] === null || p[1] === undefined || p[1] === '' ? null : Number(p[1]),
        name: p[2],
        description: p[3] || '',
        price: Number(p[4]),
        stock: Number(p[5] || 0),
        image_url: p[6] || '',
        is_active: 1,
        created_at: now()
      });
      changes = 1;
    } else if (q.startsWith('insert into orders')) {
      lastID = nextId('orders');
      data.orders.push({
        id: lastID,
        buyer_id: Number(p[0]),
        total_amount: Number(p[1]),
        status: 'pending',
        payment_method: p[5] || 'cash_on_delivery',
        payment_status: 'pending',
        delivery_type: p[2] || 'delivery',
        delivery_address: p[3] || '',
        phone: p[4] || '',
        notes: p[6] || '',
        created_at: now()
      });
      changes = 1;
    } else if (q.startsWith('insert into order_items')) {
      lastID = nextId('order_items');
      data.order_items.push({
        id: lastID,
        order_id: Number(p[0]),
        product_id: Number(p[1]),
        seller_id: Number(p[2]),
        quantity: Number(p[3]),
        unit_price: Number(p[4])
      });
      changes = 1;
    } else if (q.startsWith('update products set category_id=')) {
      const product = productById(p[7]);
      if (product) {
        product.category_id = p[0] === null || p[0] === undefined || p[0] === '' ? product.category_id : Number(p[0]);
        product.name = p[1];
        product.description = p[2];
        product.price = Number(p[3]);
        product.stock = Number(p[4]);
        product.image_url = p[5];
        product.is_active = Number(p[6]);
        changes = 1;
      }
    } else if (q === 'update products set is_active = 0 where id = ?') {
      const product = productById(p[0]);
      if (product) {
        product.is_active = 0;
        changes = 1;
      }
    } else if (q === 'update products set stock = stock - ? where id = ?') {
      const product = productById(p[1]);
      if (product) {
        product.stock = Number(product.stock) - Number(p[0]);
        changes = 1;
      }
    } else if (q === 'update orders set status = ? where id = ?') {
      const order = data.orders.find((o) => Number(o.id) === Number(p[1]));
      if (order) {
        order.status = p[0];
        changes = 1;
      }
    } else if (q === 'update users set is_active = ? where id = ?') {
      const user = userById(p[1]);
      if (user) {
        user.is_active = Number(p[0]);
        changes = 1;
      }
    } else if (q === 'update shops set status = ? where id = ?') {
      const shop = data.shops.find((s) => Number(s.id) === Number(p[1]));
      if (shop) {
        shop.status = p[0];
        changes = 1;
      }
    } else {
      throw new Error(`Unsupported database write query: ${sql}`);
    }

    await saveData();
    return { lastID, changes };
  }

  async exec(sql) {
    await ensureLoaded();
    const q = normalizeSql(sql);
    if (q === 'begin transaction') {
      transactionSnapshot = clone(data);
      return;
    }
    if (q === 'commit') {
      transactionSnapshot = null;
      await saveData();
      return;
    }
    if (q === 'rollback') {
      if (transactionSnapshot) {
        data = transactionSnapshot;
        transactionSnapshot = null;
        await saveData();
      }
      return;
    }
    return;
  }

  async close() {
    return;
  }
}

export async function getDb() {
  await ensureLoaded();
  return new LocalJsonDb();
}

export async function initDb() {
  await ensureLoaded();
  if (data.users.length > 0) return;

  const db = await getDb();
  const adminPass = await bcrypt.hash('admin123', 10);
  const sellerPass = await bcrypt.hash('seller123', 10);
  const buyerPass = await bcrypt.hash('buyer123', 10);

  await db.run(
    `INSERT INTO users (name, email, password_hash, role, phone, address, town) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['System Admin', 'admin@localexpress.com', adminPass, 'admin', '08000000000', 'Town Office', 'Local Town']
  );
  const seller = await db.run(
    `INSERT INTO users (name, email, password_hash, role, phone, address, town) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Aisha Bello', 'seller@localexpress.com', sellerPass, 'seller', '08123456789', 'Market Road', 'Local Town']
  );
  await db.run(
    `INSERT INTO users (name, email, password_hash, role, phone, address, town) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Demo Buyer', 'buyer@localexpress.com', buyerPass, 'buyer', '08011112222', 'No. 12 Unity Street', 'Local Town']
  );

  await db.run(
    `INSERT INTO shops (user_id, shop_name, description, town, status) VALUES (?, ?, ?, ?, ?)`,
    [seller.lastID, 'Aisha Variety Store', 'Quality everyday products for homes, students and small businesses.', 'Local Town', 'approved']
  );

  const cats = [
    ['Electronics', 'electronics'],
    ['Fashion', 'fashion'],
    ['Food & Groceries', 'food-groceries'],
    ['Home Essentials', 'home-essentials'],
    ['Beauty', 'beauty'],
    ['Books & Stationery', 'books-stationery']
  ];
  for (const c of cats) await db.run('INSERT INTO categories (name, slug) VALUES (?, ?)', c);

  const products = [
    [seller.lastID, 1, 'Wireless Bluetooth Earbuds', 'Clear sound earbuds with charging case. Good for calls, music and study.', 12500, 15, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80'],
    [seller.lastID, 1, 'Fast Phone Charger', 'Durable 20W charger for compatible Android and iPhone devices.', 4500, 40, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80'],
    [seller.lastID, 2, 'Classic Cotton T-Shirt', 'Soft everyday cotton T-shirt available in multiple sizes.', 6000, 30, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'],
    [seller.lastID, 3, 'Premium Rice 5kg', 'Clean local rice suitable for family meals and small restaurants.', 7800, 25, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80'],
    [seller.lastID, 4, 'LED Desk Lamp', 'Rechargeable LED study lamp with adjustable brightness.', 9500, 18, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'],
    [seller.lastID, 6, 'A4 Notebook Pack', 'Pack of 5 ruled notebooks for school, work and daily planning.', 3500, 50, 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80']
  ];
  for (const p of products) {
    await db.run(
      `INSERT INTO products (seller_id, category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p
    );
  }
}
