'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ScoringModal from '@/components/scoring/ScoringModal';
import EvidenceCard from '@/components/claims/EvidenceCard';
import type { Evidence, Rating } from '@/lib/types';
import type { ScoringPayload } from '@/lib/scoring';
import styles from './claim-detail.module.css';

interface EvidenceListProps {
  evidence: Evidence[];
  claimTitle: string;
  ratingsMap: Record<string, Rating[]>;
}

export default function EvidenceList({ evidence, claimTitle, ratingsMap }: EvidenceListProps) {
  const [scoringTarget, setScoringTarget] = useState<Evidence | null>(null);
  const supabase = createClient();

  const handleSubmitRating = async (payload: ScoringPayload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/auth/login?redirectTo=${window.location.pathname}`;
      return;
    }

    const { error } = await supabase.from('ratings').insert({
      evidence_id: payload.evidence_id,
      judge_id: user.id,
      source_credibility: payload.source_credibility,
      logical_strength: payload.logical_strength,
      relevance: payload.relevance,
      justification: payload.justification || null,
    });

    if (error) throw error;
  };

  const supporting = evidence.filter((e) => e.stance === 'supporting');
  const challenging = evidence.filter((e) => e.stance === 'challenging' || e.stance === 'derived');

  return (
    <>
      <div className={styles.splitFeedLayout}>
        <div className={styles.feedColumn}>
          <h3 className={styles.columnTitle}>
            <span className={styles.columnIcon} style={{ color: 'var(--stance-supporting)' }}>✓</span>
            Supporting Evidence
          </h3>
          <div className={styles.evidenceColumnList}>
            {supporting.length > 0 ? (
              supporting.map((item) => (
                <EvidenceCard 
                  key={item.id} 
                  evidence={item} 
                  ratings={ratingsMap[item.id] || []}
                  onScoreClick={setScoringTarget} 
                />
              ))
            ) : (
              <p className={styles.emptyColumn}>No supporting evidence submitted.</p>
            )}
          </div>
        </div>

        <div className={styles.feedColumn}>
          <h3 className={styles.columnTitle}>
            <span className={styles.columnIcon} style={{ color: 'var(--stance-challenging)' }}>✗</span>
            Challenging Evidence
          </h3>
          <div className={styles.evidenceColumnList}>
            {challenging.length > 0 ? (
              challenging.map((item) => (
                <EvidenceCard 
                  key={item.id} 
                  evidence={item} 
                  ratings={ratingsMap[item.id] || []}
                  onScoreClick={setScoringTarget} 
                />
              ))
            ) : (
              <p className={styles.emptyColumn}>No challenging evidence submitted.</p>
            )}
          </div>
        </div>
      </div>

      {/* Scoring Modal */}
      {scoringTarget && (
        <ScoringModal
          evidenceId={scoringTarget.id}
          evidenceTitle={scoringTarget.title}
          evidenceStance={scoringTarget.stance}
          claimTitle={claimTitle}
          onClose={() => setScoringTarget(null)}
          onSubmit={handleSubmitRating}
        />
      )}
    </>
  );
}
