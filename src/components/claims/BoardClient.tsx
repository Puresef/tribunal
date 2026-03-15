'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Claim, Topic } from '@/lib/types';
import ClaimCard from './ClaimCard';
import styles from '@/app/board.module.css';

interface BoardClientProps {
  initialClaims: Claim[];
  topics: Topic[];
}

export default function BoardClient({ initialClaims, topics }: BoardClientProps) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'split' | 'trending'>('trending');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Real-time subscription to claims table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE)
          schema: 'public',
          table: 'claims',
        },
        async (payload) => {
          console.log('Change received!', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedClaim = payload.new as Claim;
            setClaims((currentClaims) =>
              currentClaims.map((c) =>
                c.id === updatedClaim.id ? { ...c, ...updatedClaim } : c
              )
            );
          } else if (payload.eventType === 'INSERT') {
            // For inserts, we might need to fetch the full claim with topic info
            const { data, error } = await supabase
              .from('claims')
              .select('*, topic:topics(*), submitter:profiles!submitter_id(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data && !error) {
              setClaims((currentClaims) => [data as Claim, ...currentClaims]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredAndSortedClaims = useMemo(() => {
    let result = [...claims];

    // Filter by topic
    if (selectedTopicId) {
      result = result.filter((c) => c.topic_id === selectedTopicId);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'score') {
        return b.composite_score - a.composite_score;
      }
      if (sortBy === 'split') {
        const splitWeight = { high: 3, medium: 2, low: 1, none: 0 };
        return (splitWeight[b.split_level] || 0) - (splitWeight[a.split_level] || 0);
      }
      if (sortBy === 'trending') {
        // Simple trending algorithm: judge_count + composite_score weight
        const aScore = (a.judge_count * 2) + a.composite_score;
        const bScore = (b.judge_count * 2) + b.composite_score;
        return bScore - aScore;
      }
      return 0;
    });

    return result;
  }, [claims, sortBy, selectedTopicId]);

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <button 
            className={`badge ${sortBy === 'trending' ? 'badge-active' : ''}`}
            onClick={() => setSortBy('trending')}
          >
            Trending
          </button>
          <button 
            className={`badge ${sortBy === 'newest' ? 'badge-active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </button>
          <button 
            className={`badge ${sortBy === 'split' ? 'badge-active' : ''}`}
            onClick={() => setSortBy('split')}
          >
            Most Split
          </button>
        </div>

        <div className={styles.topicScroller}>
          <button 
            className={`badge ${!selectedTopicId ? 'badge-active' : ''}`}
            onClick={() => setSelectedTopicId(null)}
          >
            All Topics
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`badge ${selectedTopicId === topic.id ? 'badge-active' : ''}`}
              style={selectedTopicId === topic.id ? { 
                backgroundColor: `${topic.color}20`,
                borderColor: topic.color,
                color: topic.color
              } : {}}
              onClick={() => setSelectedTopicId(topic.id)}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {filteredAndSortedClaims.length > 0 ? (
        <div className={styles.grid}>
          {filteredAndSortedClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚖</div>
          <h2 className={styles.emptyTitle}>No claims found</h2>
          <p className={styles.emptyText}>
            Try adjusting your filters or be the first to submit a claim in this topic.
          </p>
        </div>
      )}
    </>
  );
}
