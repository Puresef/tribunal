import type { Metadata, ResolvingMetadata } from 'next';
import { getClaimById, getEvidenceByClaim, getRatingsForEvidenceArray, getChallengesForClaim, getCurrentProfile, getClaims } from '@/lib/actions';
import type { Claim, Evidence } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';
import EvidenceList from './EvidenceList';
import SplitBadge from '@/components/claims/SplitBadge';
import ShareButton from '@/components/claims/ShareButton';
import SettledBadge from '@/components/claims/SettledBadge';
import ClaimActions from '@/components/claims/ClaimActions';
import ScoreHistoryChart from '@/components/claims/ScoreHistoryChart';
import RelatedClaimsSidebar from '@/components/claims/RelatedClaimsSidebar';
import styles from './claim-detail.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const claim = await getClaimById(id);
    const ogUrl = new URL(`/api/og`, process.env.NEXT_PUBLIC_SITE_URL || 'https://tbnl.so');
    ogUrl.searchParams.set('title', claim.title);
    ogUrl.searchParams.set('score', claim.composite_score > 0 ? claim.composite_score.toFixed(1) : '—');
    ogUrl.searchParams.set('judges', claim.judge_count.toString());

    return {
      title: `${claim.title} | The Tribunal`,
      description: claim.description || `Community-scored claim on The Tribunal. Current composite score: ${claim.composite_score.toFixed(1)}/10.`,
      openGraph: {
        images: [
          {
            url: ogUrl.toString(),
            width: 1200,
            height: 630,
            alt: `Scorecard for ${claim.title}`,
          },
        ],
      },
    };
  } catch {
    return {
      title: 'Claim Not Found | The Tribunal',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function ClaimDetailPage({ params }: Props) {
  const { id } = await params;

  let claim: Claim;
  let evidence: Evidence[];
  let ratingsMap = {};
  let challenges: any[] = [];
  let userProfile = null;

  try {
    userProfile = await getCurrentProfile();
    claim = await getClaimById(id);
    evidence = await getEvidenceByClaim(id);
    challenges = await getChallengesForClaim(id);
    
    if (evidence.length > 0) {
      const evidenceIds = evidence.map((e) => e.id);
      ratingsMap = await getRatingsForEvidenceArray(evidenceIds);
    }
  } catch {
    return (
      <div className="content-container" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Claim not found</h1>
        <p className="text-secondary">This claim may have been removed or the URL is incorrect.</p>
        <a href="/" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>← Back to The Board</a>
      </div>
    );
  }

  const supporting = evidence.filter((e) => e.stance === 'supporting');
  const challenging = evidence.filter((e) => e.stance === 'challenging');
  
  const allRatings = Object.values(ratingsMap).flat() as any[];

  let avgSource = 0;
  let avgLogic = 0;
  let avgRelevance = 0;
  if (allRatings.length > 0) {
    avgSource = allRatings.reduce((sum, r) => sum + r.source_credibility, 0) / allRatings.length;
    avgLogic = allRatings.reduce((sum, r) => sum + r.logical_strength, 0) / allRatings.length;
    avgRelevance = allRatings.reduce((sum, r) => sum + r.relevance, 0) / allRatings.length;
  }

  let relatedClaims: Claim[] = [];
  try {
    if (claim.topic_id) {
      const topicClaims = await getClaims({ limit: 15 });
      relatedClaims = topicClaims
        .filter(c => c.id !== claim.id && c.topic_id === claim.topic_id)
        .slice(0, 4);
    }
  } catch (e) {
    console.error("Failed to fetch related claims", e);
  }

  return (
    <div className="content-container">
      <div className={styles.pageLayout}>
        <div className="mainFeed">
      {/* Hero Section */}
      <div className={styles.claimHero}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className={styles.heroBadges}>
            {claim.topic && (
              <span
                className="badge"
                style={{
                  backgroundColor: `${claim.topic.color}20`,
                  color: claim.topic.color,
                }}
              >
                {claim.topic.name}
              </span>
            )}
            <span className={`badge badge-active`}>
              {claim.status.toUpperCase()}
            </span>
            <SplitBadge level={claim.split_level} />
          </div>
          <ShareButton 
            claimId={claim.id} 
            title={claim.title} 
            score={claim.composite_score} 
          />
        </div>

        <h1 className={styles.claimTitle}>{claim.title}</h1>

        {claim.description && (
          <p className={styles.claimDescription}>{claim.description}</p>
        )}

        <div className={styles.scoreBar}>
          {claim.status === 'settled' ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <SettledBadge score={claim.composite_score} />
            </div>
          ) : (
            <>
              <div className={styles.scoreBarItem}>
                <div
                  className={styles.scoreBarValue}
                  style={{
                    color: claim.composite_score > 0
                      ? getScoreColor(claim.composite_score)
                      : 'var(--text-muted)',
                  }}
                >
                  {claim.composite_score > 0 ? claim.composite_score.toFixed(1) : '—'}
                </div>
                <div className={styles.scoreBarLabel}>COMPOSITE</div>
              </div>
              <div className={styles.scoreBarItem}>
                <div className={styles.scoreBarValue}>{claim.evidence_count}</div>
                <div className={styles.scoreBarLabel}>EVIDENCE</div>
              </div>
              <div className={styles.scoreBarItem}>
                <div className={styles.scoreBarValue}>{claim.judge_count}</div>
                <div className={styles.scoreBarLabel}>JUDGES</div>
              </div>
              <div className={styles.scoreBarItem}>
                <div className={styles.scoreBarValue}>
                  {supporting.length}/{challenging.length}
                </div>
                <div className={styles.scoreBarLabel}>FOR/AGAINST</div>
              </div>
            </>
          )}
        </div>

        {/* Dimension Bars Card */}
        {allRatings.length > 0 && claim.status !== 'settled' && (
          <div className={styles.dimensionCard}>
            <div className={styles.dimensionItem}>
              <div className={styles.dimensionHeader}>
                <span>Source Quality</span>
                <span className={styles.dimensionScore} style={{ color: getScoreColor(avgSource) }}>{avgSource.toFixed(1)}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${(avgSource / 10) * 100}%`, backgroundColor: getScoreColor(avgSource) }} />
              </div>
            </div>
            
            <div className={styles.dimensionItem}>
              <div className={styles.dimensionHeader}>
                <span>Logical Strength</span>
                <span className={styles.dimensionScore} style={{ color: getScoreColor(avgLogic) }}>{avgLogic.toFixed(1)}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${(avgLogic / 10) * 100}%`, backgroundColor: getScoreColor(avgLogic) }} />
              </div>
            </div>
            
            <div className={styles.dimensionItem}>
              <div className={styles.dimensionHeader}>
                <span>Relevance</span>
                <span className={styles.dimensionScore} style={{ color: getScoreColor(avgRelevance) }}>{avgRelevance.toFixed(1)}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${(avgRelevance / 10) * 100}%`, backgroundColor: getScoreColor(avgRelevance) }} />
              </div>
            </div>
          </div>
        )}
        
        {/* Actions Row */}
        <ClaimActions 
          claimId={claim.id} 
          claimTitle={claim.title}
          claimStatus={claim.status}
          userRank={userProfile?.rank}
        />
      </div>

      {/* Score Timeline */}
      <div className={styles.timelineSection}>
        <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--text-lg)' }}>Score History</h2>
        <ScoreHistoryChart ratings={allRatings} currentScore={claim.composite_score} />
      </div>

      {/* Evidence Section */}
      <div className={styles.evidenceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Evidence ({evidence.length})</h2>
          <a href={`/submit?claim=${id}`} className={styles.submitEvidenceButton}>
            + Submit Evidence
          </a>
        </div>

        {evidence.length > 0 ? (
          <EvidenceList evidence={evidence} claimTitle={claim.title} ratingsMap={ratingsMap} />
        ) : (
          <div className={`card ${styles.emptyEvidence}`}>
            <p>No evidence has been submitted yet.</p>
            <a href={`/submit?claim=${id}`} className={styles.submitEvidenceButton}>
              Be the first to submit evidence →
            </a>
          </div>
        )}
      </div>

      {/* Challenges Section */}
      {challenges.length > 0 && (
        <div className={styles.evidenceSection} style={{ marginTop: 'var(--space-8)' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: 'var(--warning-amber)' }}>
              ⚠️ Formal Challenges ({challenges.length})
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {challenges.map(challenge => (
              <div key={challenge.id} className="card" style={{ borderLeft: '4px solid var(--warning-amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ fontWeight: 'var(--weight-bold)' }}>
                    {challenge.challenger?.display_name || 'Anonymous Judge'}
                  </div>
                  <div className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-amber)' }}>
                    {challenge.status.toUpperCase()}
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>
                  {challenge.reason}
                </p>
                {challenge.new_evidence && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-xs text-muted" style={{ textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-1)' }}>Linked Evidence</span>
                    <a href={`#evidence-${challenge.new_evidence_id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      "{challenge.new_evidence.title}"
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

        </div>
        <aside className="sidebar">
          <RelatedClaimsSidebar claims={relatedClaims} />
        </aside>
      </div>

      {/* Sticky CTA */}
      {claim.status !== 'settled' && (
        <div className={styles.stickyCtaWrap}>
          <div className={styles.stickyCta}>
            <span className={styles.stickyText}>Have new evidence for this claim?</span>
            <a href={`/submit?claim=${id}`} className={styles.stickyButton}>
              Submit Evidence
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
