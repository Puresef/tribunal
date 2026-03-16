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

  const [activeTab, setActiveTab] = useState<'all' | 'supporting' | 'challenging' | 'controversial'>('all');

  const supporting = evidence.filter((e) => e.stance === 'supporting');
  const challenging = evidence.filter((e) => e.stance === 'challenging' || e.stance === 'derived');
  // Mock controversial for now (e.g. high divergence in scores)
  const controversial = evidence.filter((e) => e.composite_score > 0 && Math.abs(e.composite_score - 5) < 2);

  const getFilteredEvidence = () => {
    switch (activeTab) {
      case 'supporting': return supporting;
      case 'challenging': return challenging;
      case 'controversial': return controversial;
      default: return evidence;
    }
  };

  const displayedEvidence = getFilteredEvidence();

  return (
    <>
      <div className={styles.evidenceTabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          ALL EVIDENCE
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'supporting' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('supporting')}
        >
          SUPPORTING <span className={styles.tabCount}>{supporting.length}</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'challenging' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('challenging')}
        >
          CHALLENGING <span className={styles.tabCount}>{challenging.length}</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'controversial' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('controversial')}
        >
          MOST CONTROVERSIAL
        </button>
      </div>

      <div className={styles.evidenceFeedList}>
        {displayedEvidence.length > 0 ? (
          displayedEvidence.map((item) => (
            <EvidenceCard 
              key={item.id} 
              evidence={item} 
              ratings={ratingsMap[item.id] || []}
              onScoreClick={setScoringTarget} 
            />
          ))
        ) : (
          <p className={styles.emptyColumn}>No evidence found for this filter.</p>
        )}
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
