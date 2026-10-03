import { useEffect, useState } from 'react';
import { apiRequest, getImageUrl } from '../api.js';
import StatCard from '../components/StatCard.jsx';

export default function SellerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });

  async function load() {
    const [dash, cats, sellerOrders] = await Promise.all([
      apiRequest('/seller/dashboard'),
      apiRequest('/products/categories'),
      apiRequest('/orders/seller')
    ]);
    setDashboard(dash);
    setCategories(cats.categories);
    setOrders(sellerOrders.orderItems);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function addProduct(e) {
    e.preventDefault();
    setMessage('');
    try {
      await apiRequest('/products', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
      setMessage('Product added successfully.');
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(orderId, status) {
    await apiRequest(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    await load();
  }

  if (!dashboard) return <main className="container page"><div className="loading">Loading seller dashboard...</div></main>;

  return (
    <main className="container page">
      <div className="section-heading page-heading">
        <span className="eyebrow">Seller dashboard</span>
        <h1>{dashboard.shop?.shop_name || 'Your Shop'}</h1>
        <p>Manage products, stock and customer orders from one place.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Products" value={dashboard.stats.totalProducts} />
        <StatCard label="Active Products" value={dashboard.stats.activeProducts} />
        <StatCard label="Orders" value={dashboard.stats.totalOrders} />
        <StatCard label="Revenue" value={`₦${Number(dashboard.stats.revenue).toLocaleString()}`} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Add new product</h2>
          <form className="form" onSubmit={addProduct}>
            <label>Product Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="form-row">
              <label>Price<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
              <label>Stock<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label>
            </div>
            <label>Category<select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Choose category</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select></label>
            <label>Image URL<input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Paste product image link" /></label>
            {message && <div className="alert success">{message}</div>}
            <button className="primary-btn full">Add Product</button>
          </form>
        </section>

        <section className="panel">
          <h2>Your products</h2>
          <div className="seller-products">
            {dashboard.products.map((p) => (
              <div key={p.id}>
                <img src={getImageUrl(p.image_url)} alt={p.name} />
                <div><strong>{p.name}</strong><span>₦{Number(p.price).toLocaleString()} • Stock: {p.stock}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel spaced">
        <h2>Recent customer orders</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Product</th><th>Buyer</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.order_id}</td><td>{order.product_name}</td><td>{order.buyer_name}</td><td>{order.quantity}</td>
                  <td><span className={`status ${order.status}`}>{order.status.replaceAll('_', ' ')}</span></td>
                  <td><select value={order.status} onChange={(e) => updateStatus(order.order_id, e.target.value)}>
                    {['pending','confirmed','processing','ready_for_pickup','out_for_delivery','completed','cancelled'].map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                  </select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
