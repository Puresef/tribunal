import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Judicial Profile',
};

export default async function JudicialProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="content-container">
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-elevated)',
            border: '3px solid var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-2xl)',
          }}>
            ⚖
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--weight-bold)',
              marginBottom: 'var(--space-1)',
            }}>
              Judge Profile
            </h1>
            <span className="badge badge-active" style={{ display: 'inline-block' }}>MEMBER</span>
            <p className="text-tertiary" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              ID: {id}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className="score-card" style={{ color: 'var(--accent-cyan)' }}>0.00</div>
            <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Consistency Score</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {[
            { label: 'Ratings Given', value: '0' },
            { label: 'Claims Judged', value: '0' },
            { label: 'Signature Rulings', value: '0' },
            { label: 'Overturned', value: '0' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-1)' }}>
                {stat.value}
              </div>
              <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
