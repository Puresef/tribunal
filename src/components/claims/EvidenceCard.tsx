'use client';

import type { Evidence, Rating } from '@/lib/types';
import { getScoreColor, calculateComposite } from '@/lib/scoring';
import JudgeMosaic from './JudgeMosaic';
import RadarScoreChart from './RadarScoreChart';
import styles from './EvidenceCard.module.css';

interface EvidenceCardProps {
  evidence: Evidence;
  ratings?: Rating[]; // We'll pass ratings down to feed the JudgeMosaic
  onScoreClick: (evidence: Evidence) => void;
}

const STANCE_STYLES = {
  supporting: { class: styles.supportingCard, label: 'SUPPORTING EVIDENCE' },
  challenging: { class: styles.challengingCard, label: 'CHALLENGING EVIDENCE' },
  derived: { class: styles.derivedCard, label: 'DERIVED EVIDENCE' },
};

export default function EvidenceCard({ evidence, ratings = [], onScoreClick }: EvidenceCardProps) {
  const stanceInfo = STANCE_STYLES[evidence.stance] || STANCE_STYLES.supporting;
  
  // A card is marked controversial if score is mixed and there's high score variance.
  // For now, let's designate it as controversial if it meets criteria:
  const isControversial = evidence.composite_score > 0 && Math.abs(evidence.composite_score - 5) < 2;
  
  // Calculate average sub-scores
  const validRatings = ratings.filter(r => r.source_credibility !== undefined);
  const len = validRatings.length;
  const avgSource = len > 0 ? validRatings.reduce((sum, r) => sum + r.source_credibility, 0) / len : 0;
  const avgLogic = len > 0 ? validRatings.reduce((sum, r) => sum + r.logical_strength, 0) / len : 0;
  const avgRelevance = len > 0 ? validRatings.reduce((sum, r) => sum + r.relevance, 0) / len : 0;
  const displayComposite = evidence.composite_score > 0 ? evidence.composite_score : (len > 0 ? calculateComposite(avgSource, avgLogic, avgRelevance) : 0);

  return (
    <div className={`${styles.evidenceCard} ${stanceInfo.class}`}>
      {isControversial && (
        <div className={styles.controversialBanner}>
          CONTROVERSIAL
        </div>
      )}
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <div className={styles.categoryLabel}>
            {stanceInfo.label}
          </div>
          <h3 className={styles.title}>{evidence.title}</h3>
          {evidence.content && (
            <p className={styles.content}>{evidence.content}</p>
          )}
        </div>
        <div className={styles.scoreArea}>
          <div className={styles.scoreBox}>
            <span
              className={styles.scoreValue}
              style={{
                color: displayComposite > 0
                  ? getScoreColor(displayComposite)
                  : 'var(--text-muted)',
              }}
            >
              {displayComposite > 0 ? displayComposite.toFixed(1) : '—'}
            </span>
            <span className={styles.scoreLabel}>
              COMPOSITE
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.meta}>
          <JudgeMosaic ratings={ratings} maxDisplay={5} />
          {evidence.source_url && (
            <a
              href={evidence.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
              onClick={(e) => e.stopPropagation()}
            >
              🔗 Source
            </a>
          )}
          <span>Added by {evidence.submitter?.display_name || 'Anonymous'}</span>
        </div>
        
        <button
          className={styles.scoreButton}
          onClick={() => onScoreClick(evidence)}
        >
          ⚖ Judge This
        </button>
      </div>
    </div>
  );
}
