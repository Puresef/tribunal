'use client';

import type { Evidence, Rating } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';
import JudgeMosaic from './JudgeMosaic';
import RadarScoreChart from './RadarScoreChart';
import styles from './EvidenceCard.module.css';

interface EvidenceCardProps {
  evidence: Evidence;
  ratings?: Rating[]; // We'll pass ratings down to feed the JudgeMosaic
  onScoreClick: (evidence: Evidence) => void;
}

const STANCE_STYLES = {
  supporting: { class: styles.supportingCard, badgeClass: styles.stanceSupporting, label: 'SUPPORTING EVIDENCE' },
  challenging: { class: styles.challengingCard, badgeClass: styles.stanceChallenging, label: 'CHALLENGING EVIDENCE' },
  derived: { class: styles.derivedCard, badgeClass: styles.stanceDerived, label: 'DERIVED EVIDENCE' },
};

export default function EvidenceCard({ evidence, ratings = [], onScoreClick }: EvidenceCardProps) {
  const stanceInfo = STANCE_STYLES[evidence.stance] || STANCE_STYLES.supporting;
  
  // Calculate average sub-scores
  const validRatings = ratings.filter(r => r.source_credibility !== undefined);
  const len = validRatings.length;
  const avgSource = len > 0 ? validRatings.reduce((sum, r) => sum + r.source_credibility, 0) / len : 0;
  const avgLogic = len > 0 ? validRatings.reduce((sum, r) => sum + r.logical_strength, 0) / len : 0;
  const avgRelevance = len > 0 ? validRatings.reduce((sum, r) => sum + r.relevance, 0) / len : 0;
  
  return (
    <div className={`${styles.evidenceCard} ${stanceInfo.class}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <span className={`${styles.stanceBadge} ${stanceInfo.badgeClass}`}>
            {stanceInfo.label}
          </span>
          <h3 className={styles.title}>{evidence.title}</h3>
          {evidence.content && (
            <p className={styles.content}>{evidence.content}</p>
          )}
        </div>
        <div className={styles.scoreArea}>
          {evidence.composite_score > 0 && (
            <div className={styles.radarWrapper}>
              <RadarScoreChart
                sourceCredibility={avgSource}
                logicalStrength={avgLogic}
                relevance={avgRelevance}
                composite={evidence.composite_score}
                size="small"
              />
            </div>
          )}
          <div className={styles.scoreBox}>
            <span
              className={styles.scoreValue}
              style={{
                color: evidence.composite_score > 0
                  ? getScoreColor(evidence.composite_score)
                  : 'var(--text-muted)',
              }}
            >
              {evidence.composite_score > 0 ? evidence.composite_score.toFixed(1) : '—'}
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
