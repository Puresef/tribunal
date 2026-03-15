import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Fallback values
    const title = searchParams.get('title') || 'The Tribunal';
    const score = searchParams.get('score') || '—';
    const judges = searchParams.get('judges') || '0';
    
    // Simple color logic
    const numericScore = parseFloat(score);
    let scoreColor = '#A1A1AA'; // muted
    if (!isNaN(numericScore)) {
      if (numericScore >= 7) scoreColor = '#34d399'; // green
      else if (numericScore >= 4) scoreColor = '#fbbf24'; // amber
      else scoreColor = '#f87171'; // red
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#09090b', // bg-deepest
            backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            THE TRIBUNAL<span style={{ color: '#06b6d4' }}>.SO</span>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: '#ffffff', lineHeight: 1.1, maxWidth: '900px' }}>
              {title}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '60px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 24, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Composite Score</span>
                <span style={{ fontSize: 96, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 24, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Judges</span>
                <span style={{ fontSize: 96, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{judges}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', padding: '16px 32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 24, color: '#ffffff', fontWeight: 500 }}>tbnl.so</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
