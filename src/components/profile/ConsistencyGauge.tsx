'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ConsistencyGaugeProps {
  score: number; // 0.000 to 1.000
  size?: number;
}

export default function ConsistencyGauge({ score, size = 120 }: ConsistencyGaugeProps) {
  // We represent the score as a percentage 0-100
  const percentage = Math.round(score * 100);
  const remainder = 100 - percentage;

  const data = [
    { name: 'Score', value: percentage },
    { name: 'Empty', value: remainder },
  ];

  // Colors based on score thresholds (similar to composite tracking)
  let fillColor = 'var(--text-muted)';
  if (score >= 0.8) fillColor = 'var(--score-green)';
  else if (score >= 0.5) fillColor = 'var(--warning-amber)';
  else if (score > 0) fillColor = 'var(--stance-challenging)';

  return (
    <div 
      style={{ width: size, height: size, position: 'relative' }}
      aria-label={`Consistency Score: ${percentage}%`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
          >
            <Cell fill={fillColor} />
            <Cell fill="rgba(255, 255, 255, 0.05)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span 
          style={{ 
            fontFamily: 'var(--font-score)', 
            fontSize: size * 0.25, 
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}
        >
          {percentage}%
        </span>
        <span 
          style={{ 
            fontSize: size * 0.1, 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '4px'
          }}
        >
          Consistency
        </span>
      </div>
    </div>
  );
}
