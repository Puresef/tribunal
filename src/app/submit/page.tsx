'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';
import styles from './claim/submit-claim.module.css';

function SubmitEvidenceContent() {
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claim') || '';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [stance, setStance] = useState<'supporting' | 'challenging'>('supporting');
  const [targetClaimId, setTargetClaimId] = useState(claimId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetClaimId.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/auth/login?redirectTo=/submit?claim=${targetClaimId}`;
        return;
      }

      const { error: insertError } = await supabase
        .from('evidence')
        .insert({
          claim_id: targetClaimId,
          title: title.trim(),
          content: content.trim() || null,
          source_url: sourceUrl.trim() || null,
          stance,
          submitter_id: user.id,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/c/${targetClaimId}`;
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evidence');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successState}>
        <span className={styles.successIcon}>📄</span>
        <h2 className={styles.successTitle}>Evidence Submitted</h2>
        <p className="text-secondary">Redirecting to the claim...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.pageTitle}>Submit Evidence</h1>
      <p className={styles.pageSubtitle}>
        Attach a source, state your stance, and let the judges score it.
      </p>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {!claimId && (
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="claim-id">
              Claim ID *
            </label>
            <input
              id="claim-id"
              type="text"
              className={styles.input}
              placeholder="Paste the claim ID..."
              value={targetClaimId}
              onChange={(e) => setTargetClaimId(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="evidence-title">
            Evidence Title *
          </label>
          <input
            id="evidence-title"
            type="text"
            className={styles.input}
            placeholder='e.g. "Peer-reviewed study from Nature 2024"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="evidence-content">
            Summary / Key Points
          </label>
          <textarea
            id="evidence-content"
            className={styles.textarea}
            placeholder="Summarize the key points of this evidence..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="source-url">
            Source URL
          </label>
          <input
            id="source-url"
            type="url"
            className={styles.input}
            placeholder="https://..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Stance *</label>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className={`badge ${stance === 'supporting' ? 'badge-active' : ''}`}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                backgroundColor: stance === 'supporting' ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-elevated)',
                color: stance === 'supporting' ? 'var(--stance-supporting)' : 'var(--text-secondary)',
                border: `1px solid ${stance === 'supporting' ? 'var(--stance-supporting)' : 'var(--border-card)'}`,
              }}
              onClick={() => setStance('supporting')}
            >
              ✓ Supporting
            </button>
            <button
              type="button"
              className={`badge`}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                backgroundColor: stance === 'challenging' ? 'rgba(248, 113, 113, 0.15)' : 'var(--bg-elevated)',
                color: stance === 'challenging' ? 'var(--stance-challenging)' : 'var(--text-secondary)',
                border: `1px solid ${stance === 'challenging' ? 'var(--stance-challenging)' : 'var(--border-card)'}`,
              }}
              onClick={() => setStance('challenging')}
            >
              ✗ Challenging
            </button>
          </div>
        </div>

        <div className={styles.formFooter}>
          <p className={styles.disclaimer}>
            Evidence quality is scored by judges, not predetermined. Submit honestly and let the process work.
          </p>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !title.trim() || !targetClaimId.trim()}
          >
            {isSubmitting ? '⏳ Submitting...' : '📄 Submit Evidence'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <div className="content-container">
      <Suspense>
        <SubmitEvidenceContent />
      </Suspense>
    </div>
  );
}
