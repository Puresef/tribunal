/* ============================================
   Scoring Types
   ============================================ */

export type ScoreDimension = 'source_credibility' | 'logical_strength' | 'relevance';

export interface DimensionScore {
  dimension: ScoreDimension;
  value: number;   // 1.0 – 10.0
  label: string;
  description: string;
  icon: string;
}

export interface ScoringPayload {
  evidence_id: string;
  source_credibility: number;
  logical_strength: number;
  relevance: number;
  justification?: string;
}

export interface ScoringResult {
  composite: number;
  source_credibility: number;
  logical_strength: number;
  relevance: number;
  justification?: string;
}

export const DIMENSIONS: Omit<DimensionScore, 'value'>[] = [
  {
    dimension: 'source_credibility',
    label: 'Source Credibility',
    description: 'How trustworthy and authoritative is this source?',
    icon: '🔍',
  },
  {
    dimension: 'logical_strength',
    label: 'Logical Strength',
    description: 'How sound is the reasoning and argument structure?',
    icon: '🧠',
  },
  {
    dimension: 'relevance',
    label: 'Relevance',
    description: 'How directly does this evidence address the claim?',
    icon: '🎯',
  },
];

export function calculateComposite(
  source: number,
  logic: number,
  relevance: number
): number {
  return parseFloat(
    (source * 0.333 + logic * 0.333 + relevance * 0.334).toFixed(1)
  );
}

export function getScoreColor(score: number): string {
  if (score >= 7.0) return 'var(--score-high)';
  if (score >= 4.0) return 'var(--score-mid)';
  return 'var(--score-low)';
}

export function getScoreClass(score: number): string {
  if (score >= 7.0) return 'score-high';
  if (score >= 4.0) return 'score-mid';
  return 'score-low';
}

export function getScoreLabel(score: number): string {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Strong';
  if (score >= 7.0) return 'Good';
  if (score >= 5.5) return 'Mixed';
  if (score >= 4.0) return 'Weak';
  if (score >= 2.0) return 'Poor';
  return 'Rejected';
}
