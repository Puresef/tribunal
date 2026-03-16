'use client';

import type { Rating } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';
import styles from './JudgeMosaic.module.css';

interface JudgeMosaicProps {
  ratings: Rating[];
  maxDisplay?: number;
}

export default function JudgeMosaic({ ratings }: JudgeMosaicProps) {
  if (!ratings || ratings.length === 0) return null;

  return (
    <div className={styles.mosaicContainer}>
      {ratings.map((rating) => {
        const judge = rating.judge;
        const displayName = judge?.display_name || 'Anonymous';
        return (
          <div key={rating.id} className={styles.judgeRow}>
            <div 
              className={styles.avatar} 
              style={{ 
                backgroundImage: judge?.avatar_url ? `url(${judge.avatar_url})` : 'none',
              }}
              title={displayName}
            >
              {!judge?.avatar_url && <span>{displayName.slice(0, 2).toUpperCase()}</span>}
            </div>
            
            <div className={styles.judgeInfo}>
              <span className={styles.judgeName}>@{displayName.toLowerCase().replace(/\s+/g, '')}</span>
              <span className={styles.judgeScores}>
                <span style={{ color: getScoreColor(rating.source_credibility) }}>{rating.source_credibility.toFixed(1)}</span>
                <span className={styles.dot}>·</span>
                <span style={{ color: getScoreColor(rating.logical_strength) }}>{rating.logical_strength.toFixed(1)}</span>
                <span className={styles.dot}>·</span>
                <span style={{ color: getScoreColor(rating.relevance) }}>{rating.relevance.toFixed(1)}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
