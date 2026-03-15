import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settled Claims Hall',
  description: 'The definitive record of community rulings — scored, challenged, and preserved.',
};

export default function VaultPage() {
  return (
    <div className="content-container">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
        <span style={{ fontSize: 'var(--text-4xl)', display: 'block', marginBottom: 'var(--space-4)' }}>🏛</span>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-bold)',
          marginBottom: 'var(--space-3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Settled Claims Hall
        </h1>
        <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto', fontStyle: 'italic' }}>
          The definitive record of community rulings — scored, challenged, and preserved.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <button className="badge badge-settled">All Settled</button>
        <button className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: 'var(--score-high)' }}>Confirmed (&gt;8.5)</button>
        <button className="badge" style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: 'var(--score-low)' }}>Dismissed (&lt;2.0)</button>
        <button className="badge">By Topic</button>
        <button className="badge">Most Challenged</button>
      </div>

      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p className="text-secondary">Settled claims will appear here as the community reaches consensus.</p>
      </div>
    </div>
  );
}
