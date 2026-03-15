/* ============================================
   Database Types
   Reflects the Supabase schema
   ============================================ */

export type ClaimStatus = 'active' | 'unresolved' | 'settled' | 'archived';
export type EvidenceStance = 'supporting' | 'challenging' | 'derived';
export type JudgeRank = 'spectator' | 'member' | 'judge' | 'senior_judge' | 'verified_judge' | 'chief_justice';
export type SplitLevel = 'none' | 'low' | 'medium' | 'high';
export type ChallengeStatus = 'pending' | 'dismissed' | 'upheld';

export interface Topic {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  rank: JudgeRank;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface JudgeProfile {
  user_id: string;
  consistency_score: number;
  total_ratings: number;
  total_claims_judged: number;
  streak_days: number;
  last_active_at: string;
  domain_specialties: Record<string, number>;
  signature_rulings_count: number;
  overturned_count: number;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  title: string;
  description: string | null;
  topic_id: string | null;
  submitter_id: string;
  composite_score: number;
  evidence_count: number;
  judge_count: number;
  status: ClaimStatus;
  split_level: SplitLevel;
  challenge_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  topic?: Topic;
  submitter?: Profile;
}

export interface Evidence {
  id: string;
  claim_id: string;
  submitter_id: string;
  title: string;
  content: string | null;
  source_url: string | null;
  stance: EvidenceStance;
  composite_score: number;
  judge_count: number;
  split_level: SplitLevel;
  derived_from_claim_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  submitter?: Profile;
}

export interface Rating {
  id: string;
  evidence_id: string;
  judge_id: string;
  source_credibility: number;
  logical_strength: number;
  relevance: number;
  composite: number;
  justification: string | null;
  created_at: string;
  // Joined
  judge?: Profile;
}

export interface Challenge {
  id: string;
  claim_id: string;
  challenger_id: string;
  new_evidence_id: string | null;
  reason: string;
  status: ChallengeStatus;
  resolved_at: string | null;
  created_at: string;
}
