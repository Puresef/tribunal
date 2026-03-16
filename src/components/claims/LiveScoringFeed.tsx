'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './liveFeed.module.css';
import { formatDistanceToNow } from 'date-fns';

type FeedItem = {
  id: string;
  composite: number;
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
        <h3 className={styles.title}>Live Feed</h3>
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
                <img src={avatarUrl} alt={judgeName} className={styles.avatar} />
                <div className={styles.itemContent}>
                  <span className={styles.judgeName}>{judgeName}</span>
                  <span className={styles.action}> scored </span>
                  <span className={styles.evidenceName}>
                    {evidenceTitle.length > 30 ? `${evidenceTitle.substring(0, 30)}...` : evidenceTitle}
                  </span>
                  <span className={styles.action}> for </span>
                  {claimId ? (
                    <Link href={`/c/${claimId}`} className={styles.claimLink}>
                      {claimTitle.length > 30 ? `${claimTitle.substring(0, 30)}...` : claimTitle}
                    </Link>
                  ) : (
                    <span className={styles.claimLink}>Unknown Claim</span>
                  )}
                  <span className={`${styles.scoreBadge} ${getScoreClass(item.composite)}`}>
                    {item.composite.toFixed(1)}
                  </span>
                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
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
