'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChallengeModal from './ChallengeModal';
import { debugSettleClaim } from '@/lib/actions';
import styles from '@/app/c/[id]/claim-detail.module.css';

interface ClaimActionsProps {
  claimId: string;
  claimTitle: string;
  claimStatus: 'active' | 'unresolved' | 'settled' | 'archived';
  userRank?: string; // e.g., 'spectator', 'member', 'judge', 'senior_judge', 'verified_judge', 'chief_justice'
}

export default function ClaimActions({ claimId, claimTitle, claimStatus, userRank }: ClaimActionsProps) {
  const router = useRouter();
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  // Logic: Lodge Challenge is most relevant for Settled claims (to reopen/dispute),
  // but can be for Active claims (procedural/duplicate).
  const canChallenge = userRank && ['senior_judge', 'verified_judge', 'chief_justice'].includes(userRank);

  const handleSettle = async () => {
    if (!confirm('DEBUG ACTION: Force this claim to become Settled?')) return;
    setIsSettling(true);
    try {
      await debugSettleClaim(claimId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to settle claim');
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <>
      <div className={styles.utilityLinks}>
        {canChallenge && (
          <button 
            className={styles.utilityLink} 
            onClick={() => setIsChallengeModalOpen(true)}
          >
            ⚠️ Lodge Challenge
          </button>
        )}

        {/* Debug Action for ease of testing - show only for staff/high rank */}
        {userRank && userRank !== 'spectator' && claimStatus !== 'settled' && (
          <button 
            className={styles.utilityLink} 
            onClick={handleSettle}
            disabled={isSettling}
          >
            {isSettling ? '⏳ Settling...' : '🔨 Settle Claim (Debug)'}
          </button>
        )}
      </div>

      {isChallengeModalOpen && (
        <ChallengeModal
          claimId={claimId}
          claimTitle={claimTitle}
          onClose={() => setIsChallengeModalOpen(false)}
        />
      )}
    </>
  );
}
