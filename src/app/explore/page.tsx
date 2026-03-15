import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Browse claims by topic, discover the most controversial evidence, and explore the Settled Claims Hall.',
};

export default function ExplorePage() {
  return (
    <div className="content-container">
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        marginBottom: 'var(--space-2)',
      }}>
        Explore
      </h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>
        Browse claims by topic, discover splits, and explore the vault.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <a href="/explore/controversial" className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none', color: 'inherit' }}>
          <span className="badge badge-split-high" style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}>⚡</span>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>Most Split</h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>Evidence with the highest dimensional disagreement</p>
        </a>

        <a href="/explore/vault" className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none', color: 'inherit' }}>
          <span className="badge badge-settled" style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}>🏛</span>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>Settled Claims Hall</h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>The definitive record of community rulings — scored, challenged, and preserved.</p>
        </a>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <span className="badge badge-trending" style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}>🔥</span>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>By Topic</h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>Filter claims by domain: Politics, Science, Tech, Religion, and more.</p>
        </div>
      </div>
    </div>
  );
}
