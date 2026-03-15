import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboards',
  description: 'Top claims, most consistent judges, and most active tribunals.',
};

export default function LeaderboardsPage() {
  return (
    <div className="content-container">
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        marginBottom: 'var(--space-2)',
      }}>
        Leaderboards
      </h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>
        Top claims, most consistent judges, and most active tribunals.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
            🏆 Top Claims (All-Time)
          </h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>
            Claims with the highest composite scores.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
            ⚖ Top Judges (Consistency)
          </h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>
            Judges with the highest consistency scores across domains.
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-3)' }}>
            🔥 Most Active
          </h2>
          <p className="text-tertiary" style={{ fontSize: 'var(--text-sm)' }}>
            Claims and judges with the most activity this week.
          </p>
        </div>
      </div>
    </div>
  );
}
