import type { Metadata, ResolvingMetadata } from 'next';
import { getClaimById, getEvidenceByClaim, getRatingsForEvidenceArray, getChallengesForClaim, getCurrentProfile, getClaims } from '@/lib/actions';
import type { Claim, Evidence } from '@/lib/types';
import { getScoreColor, calculateComposite } from '@/lib/scoring';
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

  const displayCompositeScore = allRatings.length > 0 ? calculateComposite(avgSource, avgLogic, avgRelevance) : 0;

  let relatedClaims: Claim[] = [];
  try {
    const topicClaims = await getClaims({ limit: 15 });
    if (claim.topic_id) {
      relatedClaims = topicClaims
        .filter((c: Claim) => c.id !== claim.id && c.topic_id === claim.topic_id)
        .slice(0, 4);
    }
    
    // Fallback if no matching topic claims found
    if (relatedClaims.length === 0) {
      relatedClaims = topicClaims.filter((c: Claim) => c.id !== claim.id).slice(0, 4);
    }
  } catch (e) {
    console.error("Failed to fetch related claims", e);
  }

  return (
    <div className="content-container layout-wide">
      <div className={styles.pageLayout}>
        <main className={styles.mainContent}>
      {/* Hero Section */}
      <div className={styles.claimHero}>
        {/* New Dashboard Hero Layout */}
        <div className={styles.claimHeroHeader}>
          <div className={styles.claimHeroMain}>
            <h1 className={styles.claimTitle}>{claim.title}</h1>
            <div className={styles.claimSubmitterInfo}>
              <span className={styles.submitterName}>Added by {evidence[0]?.submitter?.display_name || 'Anonymous'}</span>
              <span className={styles.metadataDivider}>•</span>
              <span className={styles.metadataText}>{evidence.length} evidence entries</span>
              <span className={styles.metadataDivider}>•</span>
              <span className={styles.metadataText}>{claim.judge_count} judges deliberating</span>
            </div>
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
            
            {claim.description && (
              <p className={styles.claimDescription}>{claim.description}</p>
            )}
          </div>
          
          <div className={styles.claimHeroActions}>
            <ShareButton 
              claimId={claim.id} 
              title={claim.title} 
              score={claim.composite_score} 
            />
          </div>
        </div>

        {/* Dashboard Score Card */}
        <div className={styles.dashboardScoreCard}>
          <div className={styles.compositeScoreSection}>
            <div className={styles.compositeScoreValue} style={{ color: displayCompositeScore > 0 ? getScoreColor(displayCompositeScore) : 'var(--text-muted)' }}>
              {displayCompositeScore > 0 ? displayCompositeScore.toFixed(1) : '—'}
            </div>
            <div className={styles.compositeScoreLabel}>COMPOSITE SCORE</div>
          </div>
          
          <div className={styles.verticalStatsSection}>
            <div className={styles.verticalStat}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Source Reliability</span>
                <span className={styles.statScore} style={{ color: 'var(--score-high)' }}>{avgSource > 0 ? avgSource.toFixed(1) : '—'}</span>
              </div>
              <div className={styles.statBarBg}>
                <div className={styles.statBarFill} style={{ width: `${(avgSource / 10) * 100}%`, backgroundColor: 'var(--score-high)' }}></div>
              </div>
            </div>
            
            <div className={styles.verticalStat}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Logical Strength</span>
                <span className={styles.statScore} style={{ color: 'var(--score-mid)' }}>{avgLogic > 0 ? avgLogic.toFixed(1) : '—'}</span>
              </div>
              <div className={styles.statBarBg}>
                <div className={styles.statBarFill} style={{ width: `${(avgLogic / 10) * 100}%`, backgroundColor: 'var(--score-mid)' }}></div>
              </div>
            </div>

            <div className={styles.verticalStat}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Context Relevance</span>
                <span className={styles.statScore} style={{ color: 'var(--accent-pink)' }}>{avgRelevance > 0 ? avgRelevance.toFixed(1) : '—'}</span>
              </div>
              <div className={styles.statBarBg}>
                <div className={styles.statBarFill} style={{ width: `${(avgRelevance / 10) * 100}%`, backgroundColor: 'var(--accent-pink)' }}></div>
              </div>
            </div>

            <div className={styles.verticalStat}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Controversy Index</span>
                <span className={styles.statScore} style={{ color: claim.split_level === 'high' ? 'var(--accent-pink)' : 'var(--text-muted)' }}>
                  {claim.split_level.toUpperCase()}
                </span>
              </div>
              <div className={styles.statBarBg}>
                <div className={styles.statBarFill} style={{ width: claim.split_level === 'high' ? '80%' : claim.split_level === 'medium' ? '50%' : '20%', backgroundColor: claim.split_level === 'high' ? 'var(--accent-pink)' : 'var(--text-muted)' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Row */}
        <ClaimActions 
          claimId={claim.id} 
          claimTitle={claim.title}
          claimStatus={claim.status}
          userRank={userProfile?.rank}
        />
      </div>

      {/* Score Timeline is moving to sidebar */}

      {/* Evidence Section */}
      <div className={styles.evidenceSection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)' }}>
            <h2 className={styles.sectionTitle}>Evidence</h2>
            <span className={styles.evidenceCountBadge}>{evidence.length}</span>
          </div>
        </div>

        {evidence.length > 0 ? (
          <EvidenceList evidence={evidence} claimTitle={claim.title} ratingsMap={ratingsMap} />
        ) : (
          <div className={`card ${styles.emptyEvidence}`}>
            <p>No evidence has been submitted yet.</p>
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

        </main>
        
        <aside className={styles.sidebar}>
          {/* Score Timeline */}
          <div className={`${styles.timelineSection} ${styles.sidebarCard}`}>
            <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--text-lg)' }}>Score History</h2>
            <ScoreHistoryChart ratings={allRatings} currentScore={displayCompositeScore} />
          </div>

          {relatedClaims && relatedClaims.length > 0 && (
            <div className={styles.sidebarCard} style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <RelatedClaimsSidebar claims={relatedClaims} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
