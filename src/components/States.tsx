import { Link } from 'react-router-dom';

export function EmptyState({ title, message, actionLabel, actionTo }: {
  title: string; message: string; actionLabel?: string; actionTo?: string;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 20px' }}>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 20px' }}>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h3>
      <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>
        {message || 'We could not complete that request.'}
      </p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '1/1' }} />
          <div style={{ padding: 14, display: 'grid', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
            <div className="skeleton" style={{ height: 32 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
