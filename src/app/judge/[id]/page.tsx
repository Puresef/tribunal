import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { getJudgeProfileById, getJudgeRecentRatings } from '@/lib/actions';
import { getScoreColor } from '@/lib/scoring';
import JudgeRankBadge from '@/components/profile/JudgeRankBadge';
import ConsistencyGauge from '@/components/profile/ConsistencyGauge';
import styles from './judge-profile.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const profile = await getJudgeProfileById(id);
    return {
      title: `${profile.display_name} | Judicial Profile`,
      description: `View the rulings and consistency score of ${profile.display_name} on The Tribunal.`,
    };
  } catch {
    return {
      title: 'Profile Not Found | The Tribunal',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function JudicialProfilePage({ params }: Props) {
  const { id } = await params;

  let profile;
  let recentRatings = [];

  try {
    profile = await getJudgeProfileById(id);
    recentRatings = await getJudgeRecentRatings(id);
  } catch (error) {
    return (
      <div className="content-container" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>Profile not found</h1>
        <p className="text-secondary">This judge does not exist or the ID is incorrect.</p>
        <Link href="/" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>← Back to The Board</Link>
      </div>
    );
  }

  const s = profile.stats || {};
  const consistencyScore = s.consistency_score ? Number(s.consistency_score) : 0;
  
  // Calculate top domains from recent ratings if domain_specialties is empty
  let domains: [string, number][] = [];
  if (s.domain_specialties && Object.keys(s.domain_specialties).length > 0) {
    domains = Object.entries(s.domain_specialties) as [string, number][];
    domains.sort((a, b) => (b[1] as number) - (a[1] as number));
  } else {
    // Basic frequency map based on recent ratings limits
    const freq: Record<string, number> = {};
    recentRatings.forEach(r => {
      const topicName = r.evidence?.claim?.topic?.name || 'Uncategorized';
      freq[topicName] = (freq[topicName] || 0) + 1;
    });
    domains = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }

  return (
    <div className="content-container">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className={styles.avatarImage} />
            ) : (
              (profile.display_name || 'J').charAt(0).toUpperCase()
            )}
          </div>
          
          <div className={styles.infoColumn}>
            <div className={styles.nameRow}>
              <h1 className={styles.displayName}>{profile.display_name || 'Anonymous Judge'}</h1>
              <JudgeRankBadge rank={profile.rank || 'spectator'} />
            </div>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            <span className={styles.idLine}>ID: {profile.id.split('-')[0]}••••</span>
          </div>

          <div className={styles.gaugeContainer}>
            <ConsistencyGauge score={consistencyScore} />
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          {[
            { label: 'Ratings Given', value: s.total_ratings || 0 },
            { label: 'Claims Judged', value: s.total_claims_judged || 0 },
            { label: 'Signature Rulings', value: s.signature_rulings_count || 0 },
            { label: 'Streak Days', value: s.streak_days || 0 },
          ].map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Layout */}
        <div className={styles.contentLayout}>
          
          {/* Left Column: Recent Rulings */}
          <div>
            <h2 className={styles.sectionTitle}>Recent Rulings</h2>
            {recentRatings.length > 0 ? (
              <div className={styles.ratingsFeed}>
                {recentRatings.map((rating) => (
                  <div key={rating.id} className={styles.ratingCard}>
                    <div className={styles.ratingHeader}>
                      <div className={styles.ratingContext}>
                        Scored on claim:{' '}
                        <Link href={`/c/${rating.evidence?.claim_id}`} className={styles.claimLink}>
                          {rating.evidence?.claim?.title || 'Unknown Claim'}
                        </Link>
                      </div>
                      <div 
                        className={styles.ratingScore}
                        style={{ color: getScoreColor(rating.composite) }}
                      >
                        {rating.composite.toFixed(1)}
                      </div>
                    </div>
                    
                    <Link href={`/c/${rating.evidence?.claim_id}#evidence-${rating.evidence_id}`} className={styles.evidenceLink}>
                      ↳ {rating.evidence?.stance === 'supporting' ? 'Supporting' : 'Challenging'} evidence: "{rating.evidence?.title}"
                    </Link>

                    {rating.justification && (
                      <div className={styles.justification}>
                        "{rating.justification}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                This judge hasn't submitted any rulings yet.
              </div>
            )}
          </div>

          {/* Right Column: Specialties */}
          <div>
            <h2 className={styles.sectionTitle}>Domain Specialties</h2>
            {domains.length > 0 ? (
              <div className={styles.domainList}>
                {domains.map(([domain, count]) => (
                  <div key={domain} className={styles.domainItem}>
                    <span className={styles.domainName}>{domain}</span>
                    <span className={styles.domainCount}>{count} rulings</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No clear specialties developed yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
