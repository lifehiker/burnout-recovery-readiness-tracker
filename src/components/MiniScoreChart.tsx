'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MiniChartProps {
  data: { date: string; score: number | null }[]
}

export function MiniScoreChart({ data }: MiniChartProps) {
  return (
    <ResponsiveContainer width='100%' height={140}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
        <XAxis dataKey='date' tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(value: number) => [value, 'Score']}
        />
        <Line
          type='monotone'
          dataKey='score'
          stroke='#6366f1'
          strokeWidth={2}
          dot={{ r: 3, fill: '#6366f1' }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
