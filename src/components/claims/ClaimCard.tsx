import Link from 'next/link';
import { getScoreColor } from '@/lib/scoring';
import type { Claim } from '@/lib/types';
import SplitBadge from './SplitBadge';
import styles from './ClaimCard.module.css';

interface ClaimCardProps {
  claim: Claim;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const topicColor = claim.topic?.color || '#60a5fa';

  return (
    <Link href={`/c/${claim.id}`} className={`card ${styles.claimCard}`}>
      <div className={styles.cardHeader}>
        <div>
          {claim.topic && (
            <span
              className={styles.topicBadge}
              style={{
                backgroundColor: `${topicColor}20`,
                color: topicColor,
              }}
            >
              {claim.topic.name}
            </span>
          )}
        </div>
        <div className={styles.scoreBox}>
          <span
            className={styles.scoreValue}
            style={{ color: claim.composite_score > 0 ? getScoreColor(claim.composite_score) : 'var(--text-muted)' }}
          >
            {claim.composite_score > 0 ? claim.composite_score.toFixed(1) : '—'}
          </span>
          <span className={styles.scoreLabel}>Score</span>
        </div>
      </div>

      <h3 className={styles.claimTitle}>{claim.title}</h3>

      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>
          <span className={styles.metaIcon}>📄</span>
          {claim.evidence_count} evidence
        </span>
        <span className={styles.metaItem}>
          <span className={styles.metaIcon}>⚖</span>
          {claim.judge_count} judges
        </span>
        <SplitBadge level={claim.split_level} />
      </div>
    </Link>
  );
}
