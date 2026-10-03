import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container page">
      <div className="empty-state">
        <div className="empty-emoji">🔎</div>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="primary-btn" to="/">Go home</Link>
      </div>
    </main>
  );
}
