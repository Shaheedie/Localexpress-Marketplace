import { ArrowLeft, CheckCircle2, MapPin, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiRequest, getImageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    apiRequest(`/products/${id}`).then((data) => setProduct(data.product)).catch(console.error);
  }, [id]);

  if (!product) return <main className="container page"><div className="loading">Loading product...</div></main>;

  return (
    <main className="container page">
      <Link to="/products" className="back-link"><ArrowLeft size={16} /> Back to products</Link>
      <section className="details-grid">
        <div className="details-image">
          <img src={getImageUrl(product.image_url)} alt={product.name} />
        </div>
        <div className="details-copy">
          <span className="pill">{product.category_name || 'General'}</span>
          <h1>{product.name}</h1>
          <p className="details-desc">{product.description}</p>
          <div className="price-large">₦{Number(product.price).toLocaleString()}</div>
          <div className="shop-panel">
            <h3>{product.shop_name || product.seller_name}</h3>
            <p><MapPin size={16} /> {product.shop_town || 'Local Town'}</p>
            <p><CheckCircle2 size={16} /> Stock available: {product.stock}</p>
          </div>
          <div className="quantity-row">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={16} /></button>
          </div>
          <button className="primary-btn full" onClick={() => addToCart(product, quantity)}>
            <ShoppingCart size={18} /> Add to Cart
          </button>
        </div>
      </section>
    </main>
  );
}
