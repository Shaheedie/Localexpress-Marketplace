import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingCart, Store, User, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();

  const navLinks = [
    ['/', 'Home'],
    ['/products', 'Products'],
    ...(user ? [['/orders', 'My Orders']] : []),
    ...(user?.role === 'seller' ? [['/seller', 'Seller Dashboard']] : []),
    ...(user?.role === 'admin' ? [['/admin', 'Admin']] : [])
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon"><Store size={22} /></span>
          <span>LocalExpress</span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {navLinks.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
          <Link className="cart-link" to="/cart" onClick={() => setOpen(false)}>
            <ShoppingCart size={18} /> Cart <span>{count}</span>
          </Link>
          {user ? (
            <div className="user-pill">
              <User size={16} />
              <span>{user.name}</span>
              <button onClick={() => { logout(); setOpen(false); }}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="ghost-btn" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="primary-btn small" onClick={() => setOpen(false)}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
