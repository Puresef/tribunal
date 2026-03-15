'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DIMENSIONS,
  calculateComposite,
  getScoreColor,
  getScoreClass,
  getScoreLabel,
} from '@/lib/scoring';
import type { ScoreDimension, ScoringPayload } from '@/lib/scoring';
import RadarScoreChart from '@/components/claims/RadarScoreChart';
import styles from './ScoringModal.module.css';

interface ScoringModalProps {
  evidenceId: string;
  evidenceTitle: string;
  evidenceStance: 'supporting' | 'challenging' | 'derived';
  claimTitle: string;
  onClose: () => void;
  onSubmit: (payload: ScoringPayload) => Promise<void>;
}

const STANCE_LABELS: Record<string, { label: string; className: string }> = {
  supporting: { label: 'Supporting', className: 'stance-supporting' },
  challenging: { label: 'Challenging', className: 'stance-challenging' },
  derived: { label: 'Derived', className: 'stance-derived' },
};

export default function ScoringModal({
  evidenceId,
  evidenceTitle,
  evidenceStance,
  claimTitle,
  onClose,
  onSubmit,
}: ScoringModalProps) {
  const [scores, setScores] = useState<Record<ScoreDimension, number>>({
    source_credibility: 5.0,
    logical_strength: 5.0,
    relevance: 5.0,
  });

  const [justification, setJustification] = useState('');
  const [showJustification, setShowJustification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalComposite, setFinalComposite] = useState(0);

  const composite = calculateComposite(
    scores.source_credibility,
    scores.logical_strength,
    scores.relevance
  );

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !showSuccess) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting, showSuccess]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSliderChange = useCallback(
    (dimension: ScoreDimension, value: number) => {
      setScores((prev) => ({
        ...prev,
        [dimension]: parseFloat(value.toFixed(1)),
      }));
    },
    []
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit({
        evidence_id: evidenceId,
        source_credibility: scores.source_credibility,
        logical_strength: scores.logical_strength,
        relevance: scores.relevance,
        justification: justification.trim() || undefined,
      });

      setFinalComposite(composite);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setIsSubmitting(false);
    }
  };

  const stanceInfo = STANCE_LABELS[evidenceStance];

  return (
    <div className={styles.overlay} onClick={(e) => {
      if (e.target === e.currentTarget && !isSubmitting && !showSuccess) onClose();
    }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Score evidence">
        {/* Success state */}
        {showSuccess && (
          <div className={styles.successOverlay}>
            <span className={styles.successIcon}>⚖️</span>
            <h2 className={styles.successTitle}>Verdict Delivered</h2>
            <div
              className={styles.successComposite}
              style={{ color: getScoreColor(finalComposite) }}
            >
              {finalComposite.toFixed(1)}
            </div>
            <div style={{ marginBottom: 'var(--space-6)', width: '100%', maxWidth: '280px' }}>
              <RadarScoreChart
                sourceCredibility={scores.source_credibility}
                logicalStrength={scores.logical_strength}
                relevance={scores.relevance}
                composite={finalComposite}
                size="large"
              />
            </div>
            <div className={styles.successActions}>
              <button className={styles.shareButton}>
                Share Score Card
              </button>
              <button className={styles.doneButton} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>⚖ Deliver Your Verdict</h2>
            <p>Score this evidence across three dimensions. Your ruling is permanent.</p>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close scoring modal"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Evidence context */}
        <div className={styles.evidenceContext}>
          <div className={styles.evidenceTitle}>{evidenceTitle}</div>
          <div className={`${styles.evidenceStance} ${stanceInfo.className}`}>
            {stanceInfo.label} · {claimTitle}
          </div>
        </div>

        {/* Sliders */}
        <div className={styles.sliders}>
          {DIMENSIONS.map((dim) => {
            const value = scores[dim.dimension];
            const color = getScoreColor(value);

            return (
              <div key={dim.dimension} className={styles.dimensionRow}>
                <div className={styles.dimensionHeader}>
                  <div>
                    <div className={styles.dimensionLabel}>
                      <span className={styles.dimensionIcon}>{dim.icon}</span>
                      {dim.label}
                    </div>
                    <div className={styles.dimensionDescription}>{dim.description}</div>
                  </div>
                  <span className={styles.dimensionValue} style={{ color }}>
                    {value.toFixed(1)}
                  </span>
                </div>
                <div className={styles.sliderTrack}>
                  <div
                    className={styles.sliderFill}
                    style={{
                      width: `${((value - 1) / 9) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={value}
                    onChange={(e) =>
                      handleSliderChange(dim.dimension, parseFloat(e.target.value))
                    }
                    className={styles.sliderInput}
                    aria-label={`${dim.label} score`}
                    disabled={isSubmitting}
                  />
                </div>
                <div className={styles.sliderScale}>
                  <span>1.0</span>
                  <span>5.0</span>
                  <span>10.0</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composite preview */}
        <div
          className={`${styles.compositePreview} ${composite !== 5.0 ? styles.active : ''}`}
          style={{
            boxShadow: composite !== 5.0
              ? `0 0 20px ${getScoreColor(composite)}20`
              : undefined,
          }}
        >
          <div className={styles.compositeLabel}>Your Composite Score</div>
          <div
            className={styles.compositeScore}
            style={{ color: getScoreColor(composite) }}
          >
            {composite.toFixed(1)}
          </div>
          <div className={styles.compositeScoreLabel}>
            {getScoreLabel(composite)}
          </div>
          <div className={styles.compositeBreakdown}>
            <div className={styles.breakdownItem}>
              <div
                className={styles.breakdownValue}
                style={{ color: getScoreColor(scores.source_credibility) }}
              >
                {scores.source_credibility.toFixed(1)}
              </div>
              <div className={styles.breakdownLabel}>Source</div>
            </div>
            <div className={styles.breakdownItem}>
              <div
                className={styles.breakdownValue}
                style={{ color: getScoreColor(scores.logical_strength) }}
              >
                {scores.logical_strength.toFixed(1)}
              </div>
              <div className={styles.breakdownLabel}>Logic</div>
            </div>
            <div className={styles.breakdownItem}>
              <div
                className={styles.breakdownValue}
                style={{ color: getScoreColor(scores.relevance) }}
              >
                {scores.relevance.toFixed(1)}
              </div>
              <div className={styles.breakdownLabel}>Relevance</div>
            </div>
          </div>
        </div>

        {/* Justification (collapsible) */}
        <div className={styles.justificationSection}>
          <button
            className={styles.justificationToggle}
            onClick={() => setShowJustification(!showJustification)}
          >
            <span className={`${styles.caret} ${showJustification ? styles.caretOpen : ''}`}>
              ▶
            </span>
            Add justification (recommended)
          </button>
          {showJustification && (
            <>
              <textarea
                className={styles.justificationTextarea}
                placeholder="Why did you score it this way? Strong justifications build your judicial reputation..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className={styles.justificationHint}>
                Justifications strengthen your consistency score and judicial profile.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            Scores reflect evidence quality, not truth. You&apos;re judging methodology, not conclusions.
          </p>
          <button
            className={`${styles.verdictButton} ${isSubmitting ? styles.submitting : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Submitting...' : '⚖ Deliver Verdict'}
          </button>
        </div>
      </div>
    </div>
  );
}
