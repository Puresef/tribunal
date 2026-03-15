'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Topic } from '@/lib/types';
import styles from './submit-claim.module.css';

export default function SubmitClaimPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.from('topics').select('*').order('name').then(({ data }) => {
      if (data) setTopics(data);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login?redirectTo=/submit/claim';
        return;
      }

      const { data, error: insertError } = await supabase
        .from('claims')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          topic_id: topicId || null,
          submitter_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/c/${data.id}`;
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="content-container">
        <div className={styles.successState}>
          <span className={styles.successIcon}>⚖</span>
          <h2 className={styles.successTitle}>Claim Submitted</h2>
          <p className="text-secondary">Redirecting to your claim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className={styles.formContainer}>
        <h1 className={styles.pageTitle}>Submit a Claim</h1>
        <p className={styles.pageSubtitle}>
          Propose a claim for the community to evaluate. Attach a topic and description to attract judges.
        </p>

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="claim-title">
              Claim Title *
            </label>
            <input
              id="claim-title"
              type="text"
              className={styles.input}
              placeholder='e.g. "NASA faked the moon landing" or "Coffee prevents heart disease"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              disabled={isSubmitting}
            />
            <span className={styles.charCount}>{title.length}/200</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="claim-description">
              Description (Optional)
            </label>
            <textarea
              id="claim-description"
              className={styles.textarea}
              placeholder="Provide context, scope, or nuance for this claim..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="claim-topic">
              Topic
            </label>
            <select
              id="claim-topic"
              className={styles.select}
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select a topic...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formFooter}>
            <p className={styles.disclaimer}>
              Claims are community-evaluated. Submitting a claim doesn&apos;t endorse or dispute it — it invites scrutiny.
            </p>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? '⏳ Submitting...' : '⚖ Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
