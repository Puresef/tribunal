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
