'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChallenge } from '@/lib/actions';
import styles from './ChallengeModal.module.css';

interface ChallengeModalProps {
  claimId: string;
  claimTitle: string;
  onClose: () => void;
}

export default function ChallengeModal({ claimId, claimTitle, onClose }: ChallengeModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [newEvidenceId, setNewEvidenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!reason.trim() || reason.trim().length < 20) {
      setError('Reason must be at least 20 characters long to lodge a formal challenge.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createChallenge({
        claim_id: claimId,
        reason: reason.trim(),
        new_evidence_id: newEvidenceId.trim() || undefined,
      });

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to lodge challenge. Ensure you have the required rank (Senior Judge+).');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => {
      // Close on backdrop click
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span>⚠️</span> Lodge Formal Challenge
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
              You are officially disputing the status of the following claim:
              <br/>
              <strong style={{ color: 'var(--text-primary)' }}>"{claimTitle}"</strong>
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="reason" className={styles.label}>
                Reason for Challenge *
              </label>
              <textarea
                id="reason"
                className={styles.textarea}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain in detail why this claim's current trajectory or evidence base is logically or factually flawed. (Min 20 characters)"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="evidenceId" className={styles.label}>
                Link New Evidence (Optional)
              </label>
              <input
                id="evidenceId"
                type="text"
                className={styles.input}
                value={newEvidenceId}
                onChange={(e) => setNewEvidenceId(e.target.value)}
                placeholder="Paste the ID of existing evidence that supports this challenge"
                disabled={isSubmitting}
              />
              <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                If you have submitted new counter-evidence, provide its ID here to link it directly to this challenge.
              </span>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Lodging...' : 'Lodge Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
