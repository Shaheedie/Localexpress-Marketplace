import { useEffect, useState } from 'react';
import { apiRequest, getImageUrl } from '../api.js';
import EmptyState from '../components/EmptyState.jsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders/my-orders')
      .then((data) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="container page"><div className="loading">Loading orders...</div></main>;

  return (
    <main className="container page">
      <div className="section-heading page-heading">
        <span className="eyebrow">My orders</span>
        <h1>Your order history</h1>
      </div>
      {!orders.length ? <EmptyState title="No orders yet" text="Your placed orders will appear here." actionText="Start shopping" actionLink="/products" /> : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-top">
                <div><h3>Order #{order.id}</h3><p>{new Date(order.created_at).toLocaleString()}</p></div>
                <span className={`status ${order.status}`}>{order.status.replaceAll('_', ' ')}</span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id}>
                    <img src={getImageUrl(item.image_url)} alt={item.product_name} />
                    <span>{item.product_name} × {item.quantity}</span>
                    <strong>₦{(item.unit_price * item.quantity).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
              <div className="order-total"><span>Total</span><strong>₦{Number(order.total_amount).toLocaleString()}</strong></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
