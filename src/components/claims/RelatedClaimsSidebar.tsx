import Link from 'next/link';
import type { Claim } from '@/lib/types';
import { getScoreColor } from '@/lib/scoring';

interface Props {
  claims: Claim[];
}

export default function RelatedClaimsSidebar({ claims }: Props) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="card" style={{ padding: 'var(--space-4)', position: 'sticky', top: 'var(--space-6)' }}>
      <h3 style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 'var(--text-md)', 
        marginBottom: 'var(--space-4)',
        paddingBottom: 'var(--space-2)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        Related Claims
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {claims.map((claim) => {
          // Background gets a subtle tint of the score color
          const scoreColor = claim.composite_score >= 7 ? 'var(--score-high)' : 
                           claim.composite_score >= 4 ? 'var(--score-mid)' : 'var(--score-low)';
          
          return (
            <Link 
                  key={claim.id} 
                  href={`/c/${claim.id}`}
                  style={{ 
                    display: 'flex', 
                    gap: 'var(--space-3)', 
                    textDecoration: 'none', 
                    color: 'inherit',
                    alignItems: 'flex-start',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  className="related-claim-link"
                >
                  <div style={{ flex: 1 }}>
                    {/* Header line: Topic Tag + Score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      {claim.topic ? (
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 'var(--weight-bold)',
                          color: claim.topic.color,
                          backgroundColor: `${claim.topic.color}20`,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {claim.topic.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px' }}>&nbsp;</span>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: scoreColor,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 'var(--weight-bold)',
                        fontSize: 'var(--text-sm)',
                      }}>
                        {claim.composite_score > 0 ? claim.composite_score.toFixed(1) : '—'}
                      </div>
                    </div>

                    <h4 style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--weight-medium)',
                      lineHeight: 'var(--leading-tight)',
                      transition: 'color var(--transition-fast)'
                    }}>
                      {claim.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

