import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={getImageUrl(product.image_url)} alt={product.name} />
      </Link>
      <div className="product-info">
        <p className="product-category">{product.category_name || 'General'}</p>
        <Link to={`/products/${product.id}`} className="product-title">{product.name}</Link>
        <p className="seller-name">Sold by {product.shop_name || product.seller_name}</p>
        <div className="product-bottom">
          <strong>₦{Number(product.price).toLocaleString()}</strong>
          <button className="icon-btn" onClick={() => addToCart(product, 1)} title="Add to cart">
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
