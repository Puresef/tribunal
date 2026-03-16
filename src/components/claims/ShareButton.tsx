'use client';

import { useState } from 'react';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  claimId: string;
  title: string;
  score: number;
}

export default function ShareButton({ claimId, title, score }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // If we're not in a browser environment, do nothing
    if (typeof window === 'undefined') return;

    const url = `${window.location.origin}/c/${claimId}`;
    const text = `The Tribunal scored "${title}" at ${score > 0 ? score.toFixed(1) : '—'}/10. Do you agree?`;

    // Try native share on mobile/supported browsers
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Tribunal',
          text,
          url,
        });
        return;
      } catch (err) {
        // If user cancelled, just return. 
        // If it failed for another reason, we fall through to clipboard copy.
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button 
      className={`${styles.shareButton} ${copied ? styles.copied : ''}`} 
      onClick={handleShare}
      title="Share this claim"
    >
      {copied ? '✓ Copied' : (
        <>
          <span style={{ fontSize: '1.1em' }}>🗳️</span> Share
        </>
      )}
    </button>
  );
}
