'use client';

import styles from './SettledBadge.module.css';

interface SettledBadgeProps {
  score: number;
  className?: string;
}

export default function SettledBadge({ score, className = '' }: SettledBadgeProps) {
  let statusClass = styles.inconclusive;
  let label = 'Inconclusive';
  let icon = '⚖️';

  if (score >= 7.0) {
    statusClass = styles.certified;
    label = 'Tribunal Certified';
    icon = '🎖️';
  } else if (score < 4.0) {
    statusClass = styles.dismissed;
    label = 'Tribunal Dismissed';
    icon = '🚫';
  }

  return (
    <div className={`${styles.badgeContainer} ${statusClass} ${className}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.score}>Final Score: {score.toFixed(1)}</div>
    </div>
  );
}
