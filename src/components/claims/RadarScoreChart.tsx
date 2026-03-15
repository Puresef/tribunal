'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { getScoreColor } from '@/lib/scoring';
import styles from './RadarScoreChart.module.css';

interface RadarScoreChartProps {
  sourceCredibility: number;
  logicalStrength: number;
  relevance: number;
  composite: number;
  size?: 'small' | 'large';
}

export default function RadarScoreChart({
  sourceCredibility,
  logicalStrength,
  relevance,
  composite,
  size = 'small'
}: RadarScoreChartProps) {
  // Format data for recharts
  const data = [
    { subject: 'Source', A: sourceCredibility, fullMark: 10 },
    { subject: 'Logic', A: logicalStrength, fullMark: 10 },
    { subject: 'Relevance', A: relevance, fullMark: 10 },
  ];

  // Determine accent color based on composite score
  const color = getScoreColor(composite);

  // Responsive settings based on size prop
  const chartHeight = size === 'small' ? 120 : 250;
  const outerRadius = size === 'small' ? '40%' : '65%';
  const fontSize = size === 'small' ? 9 : 12;

  // Render nothing if scores are 0 (unscored)
  if (composite === 0) return null;

  return (
    <div 
      className={styles.chartContainer} 
      style={{ height: chartHeight }}
      aria-label={`Radar chart showing scores: Source ${sourceCredibility}, Logic ${logicalStrength}, Relevance ${relevance}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={outerRadius} data={data}>
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--text-secondary)', fontSize, fontFamily: 'var(--font-ui)' }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.4}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
