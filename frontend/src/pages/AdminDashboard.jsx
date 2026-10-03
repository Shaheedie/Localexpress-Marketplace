import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import StatCard from '../components/StatCard.jsx';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  async function load() {
    const data = await apiRequest('/admin/dashboard');
    setDashboard(data);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function toggleUser(id) {
    await apiRequest(`/admin/users/${id}/toggle`, { method: 'PUT' });
    await load();
  }

  if (!dashboard) return <main className="container page"><div className="loading">Loading admin dashboard...</div></main>;

  return (
    <main className="container page">
      <div className="section-heading page-heading">
        <span className="eyebrow">Admin dashboard</span>
        <h1>Marketplace Control Center</h1>
        <p>Monitor users, sellers, orders and platform activity.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Users" value={dashboard.stats.users} />
        <StatCard label="Sellers" value={dashboard.stats.sellers} />
        <StatCard label="Products" value={dashboard.stats.products} />
        <StatCard label="Orders" value={dashboard.stats.orders} />
        <StatCard label="Gross Sales" value={`₦${Number(dashboard.stats.revenue).toLocaleString()}`} />
      </div>

      <section className="panel spaced">
        <h2>Users</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Town</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {dashboard.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.town}</td><td>{u.is_active ? 'Active' : 'Disabled'}</td>
                  <td>{u.role !== 'admin' && <button className="ghost-btn" onClick={() => toggleUser(u.id)}>{u.is_active ? 'Disable' : 'Enable'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel spaced">
        <h2>Recent Orders</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Buyer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {dashboard.orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td><td>{o.buyer_name}</td><td>₦{Number(o.total_amount).toLocaleString()}</td><td><span className={`status ${o.status}`}>{o.status.replaceAll('_', ' ')}</span></td><td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
