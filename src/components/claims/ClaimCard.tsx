import Link from 'next/link';
import { getScoreColor } from '@/lib/scoring';
import type { Claim } from '@/lib/types';
import styles from './ClaimCard.module.css';

interface ClaimCardProps {
  claim: Claim;
}

function getStatusBadge(claim: Claim) {
  // Determine a status badge based on claim attributes
  if (claim.split_level === 'high') {
    return { icon: '⚡', text: 'HIGH VOLATILITY', className: styles.badgeVolatility };
  }
  // Trending: recently created or high judge count
  const ageMs = Date.now() - new Date(claim.created_at).getTime();
  const isRecent = ageMs < 7 * 24 * 60 * 60 * 1000; // 7 days
  if (isRecent && claim.evidence_count > 0) {
    return { icon: '🔥', text: 'TRENDING NOW', className: styles.badgeTrending };
  }
  // Vault: settled/resolved claims
  if (claim.status === 'settled' || claim.status === 'archived') {
    return { icon: '🏛', text: 'VAULT ITEM', className: styles.badgeVault };
  }
  return null;
}

function formatTimestamp(date: string) {
  const ms = Date.now() - new Date(date).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return 'JUST NOW';
  if (hours < 24) return `${hours}H_AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D_AGO`;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const topicColor = claim.topic?.color || '#60a5fa';
  const statusBadge = getStatusBadge(claim);

  return (
    <Link href={`/c/${claim.id}`} className={`card ${styles.claimCard}`}>
      {/* Header: Topic + Timestamp */}
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.headerLabel}>TOPIC</span>
          {claim.topic && (
            <span className={styles.topicName} style={{ color: topicColor }}>
              {claim.topic.name.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <span className={styles.headerLabel}>TIMESTAMP</span>
          <span className={styles.timestampValue}>{formatTimestamp(claim.created_at)}</span>
        </div>
      </div>

      {/* Body: Title + Giant Score */}
      <div className={styles.cardBody}>
        <h3 className={styles.claimTitle}>{claim.title}</h3>
        <div className={styles.scoreArea}>
          <span className={styles.compositeLabel}>COMPOSITE</span>
          <span
            className={styles.scoreValue}
            style={{ color: claim.composite_score > 0 ? getScoreColor(claim.composite_score) : 'var(--text-muted)' }}
          >
            {claim.composite_score > 0 ? claim.composite_score.toFixed(1) : '—'}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      {statusBadge && (
        <div className={`${styles.statusBadge} ${statusBadge.className}`}>
          <span>{statusBadge.icon}</span>
          <span>{statusBadge.text}</span>
        </div>
      )}

      {/* Bottom Stats */}
      <div className={styles.cardStats}>
        <div className={styles.statBox}>
          <span className={styles.statBoxLabel}>EVIDENCE_POOL</span>
          <span className={styles.statBoxValue}>{claim.evidence_count > 999 ? `${(claim.evidence_count / 1000).toFixed(1)}k` : claim.evidence_count}_NODES</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statBoxLabel}>JUDICIARY_COUNT</span>
          <span className={styles.statBoxValue}>{claim.judge_count > 999 ? `${(claim.judge_count / 1000).toFixed(1)}k` : claim.judge_count}_ACTIVE</span>
        </div>
      </div>
    </Link>
  );
}

