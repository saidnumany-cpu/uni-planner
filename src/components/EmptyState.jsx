/** Boş durum göstergesi */
export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div className={`empty${compact ? ' empty-compact' : ''}`}>
      {icon && <div className="empty-icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
