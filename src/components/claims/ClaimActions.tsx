'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChallengeModal from './ChallengeModal';
import { debugSettleClaim } from '@/lib/actions';

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

  // Determine if user can challenge (Senior Judge+)
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

  if (claimStatus === 'settled') {
    return null; // No actions on settled claims
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {canChallenge && (
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsChallengeModalOpen(true)}
            style={{ 
              borderColor: 'var(--warning-amber)', 
              color: 'var(--warning-amber)',
              backgroundColor: 'rgba(245, 158, 11, 0.05)'
            }}
          >
            ⚠️ Lodge Challenge
          </button>
        )}

        {/* Debug Action for ease of testing */}
        {userRank !== 'spectator' && (
          <button 
            className="btn btn-secondary" 
            onClick={handleSettle}
            disabled={isSettling}
          >
            {isSettling ? 'Settling...' : '🔨 Settle Claim (Debug)'}
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
