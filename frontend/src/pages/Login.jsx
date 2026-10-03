import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form.email, form.password);
      if (data.user.role === 'seller') navigate('/seller');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Login to LocalExpress</h1>
        <form className="form" onSubmit={submit}>
          <label>Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </label>
          <label>Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="primary-btn full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="demo-box">
          <strong>Demo logins</strong>
          <p>Admin: admin@localexpress.com / admin123</p>
          <p>Seller: seller@localexpress.com / seller123</p>
          <p>Buyer: buyer@localexpress.com / buyer123</p>
        </div>
        <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
      </div>
    </main>
  );
}
