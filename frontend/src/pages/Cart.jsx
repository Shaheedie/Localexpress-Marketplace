import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { getImageUrl } from '../api.js';
import EmptyState from '../components/EmptyState.jsx';

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart } = useCart();

  if (!items.length) {
    return <main className="container page"><EmptyState title="Your cart is empty" text="Add products you like and come back to checkout." actionText="Shop products" actionLink="/products" /></main>;
  }

  return (
    <main className="container page">
      <div className="section-heading between page-heading">
        <div><span className="eyebrow">Shopping cart</span><h1>Your selected items</h1></div>
      </div>
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={getImageUrl(item.image_url)} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>₦{Number(item.price).toLocaleString()} each</p>
                <div className="cart-actions">
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.id, e.target.value)} />
                  <button onClick={() => removeFromCart(item.id)}><Trash2 size={16} /> Remove</button>
                </div>
              </div>
              <strong>₦{(Number(item.price) * Number(item.quantity)).toLocaleString()}</strong>
            </div>
          ))}
        </div>
        <aside className="summary-card">
          <h2>Order Summary</h2>
          <div><span>Items</span><strong>{items.length}</strong></div>
          <div><span>Total</span><strong>₦{total.toLocaleString()}</strong></div>
          <Link className="primary-btn full" to="/checkout">Proceed to Checkout</Link>
        </aside>
      </div>
    </main>
  );
}
