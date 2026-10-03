import { Link } from 'react-router-dom';

export default function EmptyState({ title, text, actionText, actionLink }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">🛒</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {actionText && <Link className="primary-btn" to={actionLink}>{actionText}</Link>}
    </div>
  );
}
