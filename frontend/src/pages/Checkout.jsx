import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    delivery_type: 'delivery',
    delivery_address: user?.address || '',
    phone: user?.phone || '',
    payment_method: 'cash_on_delivery',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ product_id: item.id, quantity: item.quantity }))
        })
      });
      clearCart();
      navigate('/orders?success=1');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page narrow">
      <div className="auth-card wide">
        <span className="eyebrow">Checkout</span>
        <h1>Complete your order</h1>
        <p className="muted">Total amount: <strong>₦{total.toLocaleString()}</strong></p>
        <form className="form" onSubmit={submit}>
          <label>Delivery Method
            <select value={form.delivery_type} onChange={(e) => setForm({ ...form, delivery_type: e.target.value })}>
              <option value="delivery">Local delivery</option>
              <option value="pickup">Pickup from seller</option>
            </select>
          </label>
          <label>Delivery Address
            <textarea value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} placeholder="Enter your street, area and nearest landmark" />
          </label>
          <label>Phone Number
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="080..." />
          </label>
          <label>Payment Method
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
              <option value="cash_on_delivery">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </label>
          <label>Order Note
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional note for the seller" />
          </label>
          {message && <div className="alert error">{message}</div>}
          <button className="primary-btn full" disabled={loading || !items.length}>{loading ? 'Placing order...' : 'Place Order'}</button>
        </form>
      </div>
    </main>
  );
}
