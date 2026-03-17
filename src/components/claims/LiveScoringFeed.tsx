'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './liveFeed.module.css';
import { formatDistanceToNow } from 'date-fns';

type FeedItem = {
  id: string;
  composite: number;
  source_credibility: number;
  logical_strength: number;
  relevance: number;
  created_at: string;
  judge?: {
    display_name: string;
    avatar_url: string;
  };
  evidence?: {
    title: string;
    claim?: {
      id: string;
      title: string;
    };
  };
};

export default function LiveScoringFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          id,
          composite,
          source_credibility,
          logical_strength,
          relevance,
          created_at,
          judge:profiles(display_name, avatar_url),
          evidence(title, claim:claims(id, title))
        `)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (data && !error) {
        setItems(data as unknown as FeedItem[]);
      }
    };
    
    fetchFeed();

    // Subscribe to new ratings
    const channel = supabase
      .channel('live-scoring')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ratings' },
        async (payload) => {
          // Fetch the full joined record for the new rating
          const { data, error } = await supabase
            .from('ratings')
            .select(`
              id,
              composite,
              source_credibility,
              logical_strength,
              relevance,
              created_at,
              judge:profiles(display_name, avatar_url),
              evidence(title, claim:claims(id, title))
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (data && !error) {
            setItems(prev => [data as unknown as FeedItem, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getScoreClass = (score: number) => {
    if (score >= 7.0) return styles.highScore;
    if (score >= 4.0) return styles.medScore;
    return styles.lowScore;
  };

  return (
    <div className={styles.feedContainer}>
      <div className={styles.header}>
        <div className={styles.pulse}></div>
        <h3 className={styles.title}>LIVE SCORING</h3>
      </div>
      
      <div className={styles.feedList}>
        {items.length === 0 ? (
          <div className={styles.time}>Awaiting verdicts...</div>
        ) : (
          items.map((item) => {
            const judgeName = item.judge?.display_name || 'Anonymous';
            const evidenceTitle = item.evidence?.title || 'Unknown Evidence';
            const claimId = item.evidence?.claim?.id;
            const claimTitle = item.evidence?.claim?.title || 'Unknown Claim';
            const avatarUrl = item.judge?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${judgeName}`;

            return (
              <div key={item.id} className={styles.feedItem}>
                <div className={styles.feedItemHeader}>
                  <div className={styles.judgeLine}>
                    <img src={avatarUrl} alt={judgeName} className={styles.avatar} />
                    <span className={styles.judgeName}>{judgeName}</span>
                  </div>
                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: false })}
                  </span>
                </div>
                {claimId ? (
                  <Link href={`/c/${claimId}`} className={styles.claimLink}>
                    {claimTitle.length > 40 ? `${claimTitle.substring(0, 40)}...` : claimTitle}
                  </Link>
                ) : (
                  <span className={styles.claimLink}>{evidenceTitle}</span>
                )}
                <div className={styles.scorePills}>
                  <span className={`${styles.scorePill} ${getScoreClass(item.source_credibility || item.composite)}`}>
                    {(item.source_credibility || item.composite).toFixed(1)}
                  </span>
                  <span className={`${styles.scorePill} ${getScoreClass(item.logical_strength || item.composite)}`}>
                    {(item.logical_strength || item.composite).toFixed(1)}
                  </span>
                  <span className={`${styles.scorePill} ${getScoreClass(item.relevance || item.composite)}`}>
                    {(item.relevance || item.composite).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
