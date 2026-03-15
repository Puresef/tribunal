import type { Metadata, ResolvingMetadata } from 'next';
import { getClaimById, getEvidenceByClaim, getRatingsForEvidenceArray } from '@/lib/actions';
import type { Claim, Evidence } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';
import EvidenceList from './EvidenceList';
import SplitBadge from '@/components/claims/SplitBadge';
import ShareButton from '@/components/claims/ShareButton';
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

  try {
    claim = await getClaimById(id);
    evidence = await getEvidenceByClaim(id);
    
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

  return (
    <div className="content-container">
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
            <div className={styles.scoreBarLabel}>Composite</div>
          </div>
          <div className={styles.scoreBarItem}>
            <div className={styles.scoreBarValue}>{claim.evidence_count}</div>
            <div className={styles.scoreBarLabel}>Evidence</div>
          </div>
          <div className={styles.scoreBarItem}>
            <div className={styles.scoreBarValue}>{claim.judge_count}</div>
            <div className={styles.scoreBarLabel}>Judges</div>
          </div>
          <div className={styles.scoreBarItem}>
            <div className={styles.scoreBarValue}>
              {supporting.length}/{challenging.length}
            </div>
            <div className={styles.scoreBarLabel}>For/Against</div>
          </div>
        </div>
      </div>

      {/* Score Timeline Stub */}
      <div className={styles.timelineSection}>
        <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--text-lg)' }}>Score History</h2>
        <div className={styles.timelinePlaceholder}>
          Interactive timeline rendering...
        </div>
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

      {/* Sticky CTA */}
      <div className={styles.stickyCtaWrap}>
        <div className={styles.stickyCta}>
          <span className={styles.stickyText}>Have an opinion on this claim?</span>
          <a href={`/submit?claim=${id}`} className={styles.stickyButton}>
            Judge Evidence
          </a>
        </div>
      </div>
    </div>
  );
}
