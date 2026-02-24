'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Jan 26', active: 145, completions: 52 },
  { date: 'Jan 28', active: 148, completions: 55 },
  { date: 'Jan 30', active: 143, completions: 53 },
  { date: 'Feb 1', active: 156, completions: 60 },
  { date: 'Feb 3', active: 162, completions: 63 },
  { date: 'Feb 5', active: 158, completions: 65 },
  { date: 'Feb 7', active: 170, completions: 68 },
  { date: 'Feb 9', active: 167, completions: 66 },
  { date: 'Feb 11', active: 175, completions: 72 },
  { date: 'Feb 13', active: 180, completions: 74 },
  { date: 'Feb 15', active: 178, completions: 75 },
  { date: 'Feb 17', active: 185, completions: 78 },
  { date: 'Feb 19', active: 190, completions: 80 },
  { date: 'Feb 21', active: 188, completions: 79 },
  { date: 'Feb 24', active: 198, completions: 84 },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs shadow-xl"
      style={{
        background: '#111E35',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <p className="mb-1.5 font-medium" style={{ color: '#94A3B8' }}>{label}</p>
      <p style={{ color: '#A855F7' }} className="font-semibold">
        {payload[0]?.value} Active Members
      </p>
      <p style={{ color: '#EC4899' }} className="font-semibold mt-0.5">
        {payload[1]?.value} Completions
      </p>
    </div>
  );
}

export function EngagementChart() {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{
        background: '#0D1526',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
            Member Engagement
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            Last 30 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-0.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366F1, #A855F7)' }}
            />
            <span style={{ color: '#94A3B8' }}>Active Members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded-full" style={{ background: '#EC4899' }} />
            <span style={{ color: '#94A3B8' }}>Completions</span>
          </div>
        </div>
      </div>

      {/* Tooltip preview */}
      <div
        className="flex items-center gap-3 mb-4 px-3 py-2 rounded-lg text-xs w-fit"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ color: '#94A3B8' }}>Latest (Feb 24):</span>
        <span style={{ color: '#A855F7' }} className="font-semibold">198 Active</span>
        <span style={{ color: '#475569' }}>/</span>
        <span style={{ color: '#EC4899' }} className="font-semibold">84 Completed</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="engActiveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="engCompletionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 220]}
            tickCount={5}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="active"
            stroke="#A855F7"
            strokeWidth={2}
            fill="url(#engActiveGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#A855F7', stroke: '#111E35', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="completions"
            stroke="#EC4899"
            strokeWidth={2}
            fill="url(#engCompletionGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#EC4899', stroke: '#111E35', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
