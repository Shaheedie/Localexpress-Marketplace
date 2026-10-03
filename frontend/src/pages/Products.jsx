import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/products/categories').then((data) => setCategories(data.categories)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({ search, category }).toString();
    apiRequest(`/products?${query}`)
      .then((data) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <main className="container page">
      <div className="section-heading between page-heading">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h1>Explore products</h1>
          <p>Find electronics, fashion, groceries, stationery and home items from local sellers.</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading products...</div> : products.length ? (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState title="No products found" text="Try another keyword or category." actionText="Clear filters" actionLink="/products" />
      )}
    </main>
  );
}
