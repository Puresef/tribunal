import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettledClaims } from '@/lib/actions';
import styles from './vault.module.css';

export const metadata: Metadata = {
  title: 'The Vault | Settled Claims Hall',
  description: 'The archive of officially settled claims and rulings on The Tribunal.',
};

// Force dynamic so we get the latest settled claims
export const dynamic = 'force-dynamic';

function getMiniBadge(score: number) {
  if (score >= 7.0) {
    return <span className={`${styles.miniBadge} ${styles.certified}`}>🎖️ {score.toFixed(1)}</span>;
  }
  if (score < 4.0) {
    return <span className={`${styles.miniBadge} ${styles.dismissed}`}>🚫 {score.toFixed(1)}</span>;
  }
  return <span className={`${styles.miniBadge} ${styles.inconclusive}`}>⚖️ {score.toFixed(1)}</span>;
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = 'recent' } = await searchParams;

  const claims = await getSettledClaims({
    sortBy: sort as any,
  });

  return (
    <div className="content-container" style={{ padding: 0 }}>
      {/* Vault Hero */}
      <div className={styles.vaultHero}>
        <h1 className={styles.vaultTitle}>
          <span style={{ fontSize: '1.2em' }}>🏛️</span> The Vault
        </h1>
        <p className={styles.vaultSubtitle}>
          The permanent archive of The Tribunal. These claims have concluded their active litigation phase and stand as official historical rulings. Only High-Ranking Judges may petition to re-open them via the Challenge System.
        </p>
      </div>

      {/* Constraints / Filters */}
      <div style={{ padding: '0 var(--space-6) var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
        <Link href="?sort=recent" className={`chip ${sort === 'recent' ? 'chip-active' : ''}`}>Recently Settled</Link>
        <Link href="?sort=score_high" className={`chip ${sort === 'score_high' ? 'chip-active' : ''}`}>Highest Certified</Link>
        <Link href="?sort=score_low" className={`chip ${sort === 'score_low' ? 'chip-active' : ''}`}>Lowest Dismissed</Link>
      </div>

      {/* Grid */}
      {claims.length > 0 ? (
        <div className={styles.vaultGrid}>
          {claims.map((claim) => (
            <Link key={claim.id} href={`/c/${claim.id}`} className={styles.vaultCard}>
              <div className={styles.cardHeader}>
                <span 
                  className={styles.cardTopic}
                  style={{ color: claim.topic?.color || 'var(--text-secondary)' }}
                >
                  {claim.topic?.name || 'Uncategorized'}
                </span>
                {getMiniBadge(claim.composite_score)}
              </div>
              
              <h3 className={styles.cardTitle}>{claim.title}</h3>
              
              <div className={styles.cardFooter}>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <span>📚</span> {claim.evidence_count} evidence
                  </div>
                  <div className={styles.metaItem}>
                    <span>⚖️</span> {claim.judge_count} judges
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🕸️</div>
          <h2>The Vault is empty.</h2>
          <p>No claims have been formally settled yet.</p>
        </div>
      )}
    </div>
  );
}
