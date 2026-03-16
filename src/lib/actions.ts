'use server';

import { createClient } from '@/lib/supabase/server';
import type { Claim, Evidence, Rating, Topic, ClaimStatus } from '@/lib/types';

/* ============================================
   Claims
   ============================================ */

export async function getClaims(options?: {
  status?: ClaimStatus;
  topicId?: string;
  sortBy?: 'newest' | 'score' | 'split' | 'trending';
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('claims')
    .select('*, topic:topics(*), submitter:profiles!submitter_id(*)')
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.topicId) {
    query = query.eq('topic_id', options.topicId);
  }

  if (options?.sortBy === 'score') {
    query = query.order('composite_score', { ascending: false });
  } else if (options?.sortBy === 'split') {
    query = query.order('split_level', { ascending: false });
  } else if (options?.sortBy === 'trending') {
    // Trending = Composite * log10(judge_count + 1) roughly
    // For now, let's just use judge_count as a proxy for trending
    query = query.order('judge_count', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options?.limit ?? 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Claim[];
}

export async function getClaimById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('claims')
    .select('*, topic:topics(*), submitter:profiles!submitter_id(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Claim;
}

export async function createClaim(input: {
  title: string;
  description?: string;
  topic_id?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('claims')
    .insert({
      title: input.title,
      description: input.description || null,
      topic_id: input.topic_id || null,
      submitter_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Claim;
}

/* ============================================
   Evidence
   ============================================ */

export async function getEvidenceByClaim(claimId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('evidence')
    .select('*, submitter:profiles!submitter_id(*)')
    .eq('claim_id', claimId)
    .order('composite_score', { ascending: false });

  if (error) throw error;
  return data as Evidence[];
}

export async function createEvidence(input: {
  claim_id: string;
  title: string;
  content?: string;
  source_url?: string;
  stance: 'supporting' | 'challenging';
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('evidence')
    .insert({
      claim_id: input.claim_id,
      title: input.title,
      content: input.content || null,
      source_url: input.source_url || null,
      stance: input.stance,
      submitter_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Evidence;
}

/* ============================================
   Ratings
   ============================================ */

export async function getRatingsByEvidence(evidenceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ratings')
    .select('*, judge:profiles!judge_id(*)')
    .eq('evidence_id', evidenceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Rating[];
}

export async function getRatingsForEvidenceArray(evidenceIds: string[]) {
  if (!evidenceIds || evidenceIds.length === 0) return {};
  
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ratings')
    .select('*, judge:profiles!judge_id(*)')
    .in('evidence_id', evidenceIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Group by evidence_id
  const map: Record<string, Rating[]> = {};
  for (const rating of (data as Rating[])) {
    if (!map[rating.evidence_id]) map[rating.evidence_id] = [];
    map[rating.evidence_id].push(rating);
  }
  
  return map;
}

export async function submitRating(input: {
  evidence_id: string;
  source_credibility: number;
  logical_strength: number;
  relevance: number;
  justification?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      evidence_id: input.evidence_id,
      judge_id: user.id,
      source_credibility: input.source_credibility,
      logical_strength: input.logical_strength,
      relevance: input.relevance,
      justification: input.justification || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Rating;
}

/* ============================================
   Topics
   ============================================ */

export async function getTopics() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Topic[];
}

export async function createTopic(input: {
  name: string;
}) {
  const supabase = await createClient();

  // Pick a random vibrant color
  const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Generate slug
  const slug = input.name.toLowerCase().replace(/[^a-z0-t0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('topics')
    .insert({
      name: input.name.trim(),
      slug,
      color,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Topic;
}

/* ============================================
   Profiles / Judges
   ============================================ */

export async function getJudgeProfileById(userId: string) {
  const supabase = await createClient();

  // Fetch the basic profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Fetch the extended judge stats
  const { data: stats, error: statsError } = await supabase
    .from('judge_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If the user hasn't scored anything, stats might not exist yet depending on the trigger
  // but our handle_new_user trigger creates it! If for some reason it's missing, we fall back safely.
  if (statsError && statsError.code !== 'PGRST116') {
    throw statsError;
  }

  return {
    ...profile,
    stats: stats || null,
  };
}

export async function getJudgeRecentRatings(userId: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      evidence:evidence(
        id, title, stance, claim_id,
        claim:claims(id, title)
      )
    `)
    .eq('judge_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/* ============================================
   Challenges & Settled Claims (Sprint 6)
   ============================================ */

export async function getSettledClaims(options?: {
  topicId?: string;
  sortBy?: 'score_high' | 'score_low' | 'recent';
}) {
  const supabase = await createClient();

  let query = supabase
    .from('claims')
    .select('*, topic:topics(*), submitter:profiles!submitter_id(*)')
    .eq('status', 'settled');

  if (options?.topicId) {
    query = query.eq('topic_id', options.topicId);
  }

  if (options?.sortBy === 'score_high') {
    query = query.order('composite_score', { ascending: false });
  } else if (options?.sortBy === 'score_low') {
    query = query.order('composite_score', { ascending: true });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Claim[];
}

export async function createChallenge(input: {
  claim_id: string;
  reason: string;
  new_evidence_id?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      claim_id: input.claim_id,
      challenger_id: user.id,
      reason: input.reason,
      new_evidence_id: input.new_evidence_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChallengesForClaim(claimId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenger:profiles!challenger_id(*), new_evidence:evidence(*)')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function debugSettleClaim(claimId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('claims')
    .update({ status: 'settled', updated_at: new Date().toISOString() })
    .eq('id', claimId)
    .select()
    .single();

  if (error) throw error;
  return data as Claim;
}

/* ============================================
   Auth Helpers
   ============================================ */

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
}
