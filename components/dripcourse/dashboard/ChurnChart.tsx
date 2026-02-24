'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type ChurnEntry = {
  module: string;
  label: string;
  rate: number;
  color: string;
  predicted?: boolean;
};

const data: ChurnEntry[] = [
  { module: 'M1', label: 'Marketing Fundamentals', rate: 2.1, color: '#22C55E' },
  { module: 'M2', label: 'Content Strategy', rate: 8.2, color: '#F59E0B' },
  { module: 'M3', label: 'Paid Advertising & PPC', rate: 14.7, color: '#EF4444' },
  { module: 'M4', label: 'Analytics & Growth Hacking', rate: 9.5, color: '#6366F1', predicted: true },
];

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: ChurnEntry }>;
}) {
  if (!active || !payload?.length || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl p-3 text-xs shadow-xl"
      style={{
        background: '#111E35',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <p className="mb-1" style={{ color: '#94A3B8' }}>{d.label}</p>
      <p className="font-semibold" style={{ color: d.color }}>
        {d.rate}% churn rate{d.predicted ? ' (predicted)' : ''}
      </p>
    </div>
  );
}

export function ChurnChart() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: '#0D1526',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
          Churn Prediction by Module
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
          Highest drop-off risk at Module 3
        </p>
      </div>

      <ResponsiveContainer width="100%" height={148}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={26}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            horizontal
            vertical={false}
          />
          <XAxis
            dataKey="module"
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 18]}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.predicted ? 'transparent' : entry.color}
                stroke={entry.color}
                strokeWidth={entry.predicted ? 1.5 : 0}
                strokeDasharray={entry.predicted ? '4 3' : undefined}
                style={
                  entry.rate === 14.7
                    ? { filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.6))' }
                    : undefined
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
          <span style={{ color: '#94A3B8' }}>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
          <span style={{ color: '#94A3B8' }}>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
          <span style={{ color: '#94A3B8' }}>High</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div
            className="w-6 border-t"
            style={{ borderColor: '#6366F1', borderStyle: 'dashed' }}
          />
          <span style={{ color: '#94A3B8' }}>Predicted</span>
        </div>
      </div>
    </div>
  );
}
