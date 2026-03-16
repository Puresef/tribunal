'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

type Rating = {
  created_at: string;
  evidence_id: string;
  composite: number;
}

interface Props {
  ratings: Rating[];
  currentScore: number;
}

export default function ScoreHistoryChart({ ratings, currentScore }: Props) {
  const data = useMemo(() => {
    if (!ratings || ratings.length === 0) return [];

    // Sort ratings chronologically
    const sorted = [...ratings].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Compute a running average of ratings as a proxy for the claim's composite score over time
    let totalScore = 0;
    
    return sorted.map((r, index) => {
      totalScore += r.composite;
      const runningAvg = totalScore / (index + 1);
      
      return {
        date: new Date(r.created_at),
        formattedDate: format(new Date(r.created_at), 'MMM d, HH:mm'),
        score: Number(runningAvg.toFixed(1)),
        ratingScore: r.composite
      };
    });
  }, [ratings]);

  if (data.length < 2) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Not enough historical data to generate timeline.
      </div>
    );
  }

  return (
    <div style={{ height: 200, width: '100%', marginTop: 'var(--space-4)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="var(--text-muted)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)' }}
            minTickGap={30}
          />
          <YAxis 
            domain={[0, 10]} 
            stroke="var(--text-muted)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-elevated)', 
              borderColor: 'var(--border-active)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'var(--accent-cyan)' }}
          />
          <ReferenceLine y={currentScore} stroke="var(--accent-cyan)" strokeDasharray="3 3" opacity={0.3} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="var(--accent-cyan)" 
            strokeWidth={2} 
            dot={{ r: 2, fill: 'var(--bg-deepest)', stroke: 'var(--accent-cyan)', strokeWidth: 2 }}
            activeDot={{ r: 4, fill: 'var(--accent-cyan)' }}
            name="Score"
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
