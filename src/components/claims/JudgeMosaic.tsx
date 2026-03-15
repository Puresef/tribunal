'use client';

import type { Rating } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';
import styles from './JudgeMosaic.module.css';

interface JudgeMosaicProps {
  ratings: Rating[];
  maxDisplay?: number;
}

export default function JudgeMosaic({ ratings, maxDisplay = 5 }: JudgeMosaicProps) {
  if (!ratings || ratings.length === 0) return null;

  const displayRatings = ratings.slice(0, maxDisplay);
  const remainingCount = Math.max(0, ratings.length - maxDisplay);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={styles.mosaicContainer}>
      {displayRatings.map((rating, index) => {
        const judge = rating.judge;
        const displayName = judge?.display_name || 'Anonymous';
        const zIndex = displayRatings.length - index;

        return (
          <div 
            key={rating.id} 
            className={styles.avatar} 
            style={{ zIndex }}
            aria-label={`Score by ${displayName}`}
          >
            {judge?.avatar_url ? (
              <img src={judge.avatar_url} alt={displayName} className={styles.avatarImage} />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}

            {/* Hover Tooltip */}
            <div className={styles.tooltip}>
              <div className={styles.tooltipHeader}>
                <span className={styles.tooltipName}>{displayName}</span>
                {judge?.rank && <span className={styles.tooltipRank}>{judge.rank.replace('_', ' ')}</span>}
              </div>
              <div className={styles.tooltipScores}>
                <div className={styles.scoreRow}>
                  <span>Source</span>
                  <span className={styles.scoreVal} style={{ color: getScoreColor(rating.source_credibility) }}>
                    {rating.source_credibility.toFixed(1)}
                  </span>
                </div>
                <div className={styles.scoreRow}>
                  <span>Logic</span>
                  <span className={styles.scoreVal} style={{ color: getScoreColor(rating.logical_strength) }}>
                    {rating.logical_strength.toFixed(1)}
                  </span>
                </div>
                <div className={styles.scoreRow}>
                  <span>Relevance</span>
                  <span className={styles.scoreVal} style={{ color: getScoreColor(rating.relevance) }}>
                    {rating.relevance.toFixed(1)}
                  </span>
                </div>
                <div className={styles.scoreRow} style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-card)'}}>
                  <span style={{ color: 'var(--text-primary)'}}>Composite</span>
                  <span className={styles.scoreVal} style={{ color: getScoreColor(rating.composite) }}>
                    {rating.composite.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <div className={styles.moreCount}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
