import { Link } from 'react-router-dom';
import { ArrowRight, PackageCheck, ShieldCheck, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiRequest('/products?limit=6').then((data) => setProducts(data.products)).catch(console.error);
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Local shopping made simple</span>
            <h1>Buy from trusted sellers around your town.</h1>
            <p>LocalExpress helps people discover nearby products, place orders quickly and support small businesses without stress.</p>
            <div className="hero-actions">
              <Link to="/products" className="primary-btn">Start Shopping <ArrowRight size={18} /></Link>
              <Link to="/register" className="secondary-btn">Become a Seller</Link>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck size={18} /> Verified sellers</span>
              <span><Truck size={18} /> Delivery or pickup</span>
              <span><PackageCheck size={18} /> Easy ordering</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="mini-card floating one">Fresh deals today</div>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1100&q=80" alt="Happy local shopping" />
            <div className="mini-card floating two">Order from town sellers</div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading centered">
          <span className="eyebrow">How it works</span>
          <h2>A marketplace built for everyday local life</h2>
        </div>
        <div className="feature-grid">
          <div className="feature-card"><Store /><h3>Sellers upload products</h3><p>Local shops can add products, prices, stock and images from their dashboard.</p></div>
          <div className="feature-card"><PackageCheck /><h3>Buyers place orders</h3><p>Customers browse, add products to cart, checkout and track order progress.</p></div>
          <div className="feature-card"><Truck /><h3>Pickup or delivery</h3><p>Orders can be delivered locally or prepared for pickup, depending on the buyer's choice.</p></div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading between">
          <div>
            <span className="eyebrow">Featured products</span>
            <h2>Popular items near you</h2>
          </div>
          <Link to="/products" className="text-link">View all products <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </main>
  );
}
