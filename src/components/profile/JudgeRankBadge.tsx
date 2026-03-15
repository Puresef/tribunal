'use client';

import type { JudgeRank } from '@/lib/types';
import styles from './JudgeRankBadge.module.css';

interface JudgeRankBadgeProps {
  rank: JudgeRank;
  className?: string;
}

const RANK_CONFIG: Record<JudgeRank, { label: string; icon: string; className: string }> = {
  spectator: { label: 'Spectator', icon: '👁️', className: styles.spectator },
  member: { label: 'Member', icon: '👤', className: styles.member },
  judge: { label: 'Judge', icon: '⚖️', className: styles.judge },
  senior_judge: { label: 'Senior Judge', icon: '🏛️', className: styles.senior_judge },
  verified_judge: { label: 'Verified Judge', icon: '✅', className: styles.verified_judge },
  chief_justice: { label: 'Chief Justice', icon: '👑', className: styles.chief_justice },
};

export default function JudgeRankBadge({ rank, className = '' }: JudgeRankBadgeProps) {
  const config = RANK_CONFIG[rank] || RANK_CONFIG.spectator;

  return (
    <div className={`${styles.badge} ${config.className} ${className}`}>
      <span className={styles.icon}>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
