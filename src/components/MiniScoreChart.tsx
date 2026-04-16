'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MiniChartProps {
  data: { date: string; score: number | null }[]
}

export function MiniScoreChart({ data }: MiniChartProps) {
  return (
    <ResponsiveContainer width='100%' height={140}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#dfd3c4' />
        <XAxis dataKey='date' tick={{ fontSize: 11, fill: '#756a5d' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#756a5d' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 14, border: '1px solid #d5c8b7', backgroundColor: '#fffdf8' }}
          formatter={(value: number) => [value, 'Score']}
        />
        <Line
          type='monotone'
          dataKey='score'
          stroke='#1e6d67'
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#1e6d67' }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
