import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', town: '', shopName: '', shopDescription: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await register({ ...form, role });
      navigate(role === 'seller' ? '/seller' : '/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card wide">
        <span className="eyebrow">Join the marketplace</span>
        <h1>Create your account</h1>
        <div className="role-tabs">
          <button className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>Buyer</button>
          <button className={role === 'seller' ? 'active' : ''} onClick={() => setRole('seller')}>Seller</button>
        </div>
        <form className="form two-col" onSubmit={submit}>
          <label>Full Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Town<input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} placeholder="Your town" /></label>
          <label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          {role === 'seller' && (
            <>
              <label>Shop Name<input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></label>
              <label>Shop Description<input value={form.shopDescription} onChange={(e) => setForm({ ...form, shopDescription: e.target.value })} /></label>
            </>
          )}
          {error && <div className="alert error span-2">{error}</div>}
          <button className="primary-btn full span-2" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  );
}
