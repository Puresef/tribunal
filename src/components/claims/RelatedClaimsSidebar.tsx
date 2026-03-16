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
        {claims.map(claim => (
          <Link 
            key={claim.id} 
            href={`/c/${claim.id}`}
            style={{ 
              display: 'flex', 
              gap: 'var(--space-3)', 
              textDecoration: 'none', 
              color: 'inherit',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: claim.composite_score >= 7 ? 'rgba(74, 222, 128, 0.1)' : 
                               claim.composite_score >= 4 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              color: getScoreColor(claim.composite_score),
              fontFamily: 'var(--font-mono)',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-sm)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              minWidth: '40px'
            }}>
              {claim.composite_score.toFixed(1)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 'var(--weight-medium)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--space-1)',
                transition: 'color var(--transition-fast)'
              }}>
                {claim.title}
              </h4>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {claim.judge_count} judges
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
