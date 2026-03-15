import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Most Split',
  description: 'Evidence with the highest dimensional disagreement among judges.',
};

export default function ControversialPage() {
  return (
    <div className="content-container">
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 'var(--weight-bold)',
        marginBottom: 'var(--space-2)',
      }}>
        Most Split
      </h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-8)' }}>
        Evidence where judges disagree the most across Source, Logic, and Relevance.
      </p>
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p className="text-secondary">Split evidence feed coming soon.</p>
      </div>
    </div>
  );
}
