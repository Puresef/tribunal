'use client';

import type { SplitLevel } from '@/lib/types';
import styles from './SplitBadge.module.css';

interface SplitBadgeProps {
  level: SplitLevel;
  className?: string;
}

export default function SplitBadge({ level, className = '' }: SplitBadgeProps) {
  if (level === 'none') {
    return null;
  }

  const badgeClass = styles[level] || styles.low;

  return (
    <div className={`${styles.badge} ${badgeClass} ${className}`}>
      <span className={styles.icon}>⚡</span>
      <span>{level} Split</span>
    </div>
  );
}
