import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Target } from 'lucide-react';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;

  const pointsArr = data.map((val, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((val - min) / range) * (h - 4) - 2,
  }));

  const polyline = pointsArr.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `0,${h} ${polyline} ${w},${h}`;
  const hexId = color.replace('#', '');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`sp-${hexId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sp-${hexId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cards = [
  {
    label: 'Active Members',
    value: '527',
    change: '+12.4%',
    trend: 'up' as const,
    icon: Users,
    topColor: '#6366F1',
    sparkColor: '#6366F1',
    sparkData: [380, 400, 415, 425, 438, 450, 462, 474, 489, 500, 510, 519, 527],
  },
  {
    label: 'Monthly Revenue',
    value: '$8,940',
    change: '+8.7%',
    trend: 'up' as const,
    icon: DollarSign,
    topColor: '#22C55E',
    sparkColor: '#22C55E',
    sparkData: [7200, 7380, 7550, 7700, 7850, 8000, 8150, 8300, 8470, 8620, 8730, 8840, 8940],
  },
  {
    label: 'Churn Rate',
    value: '8.2%',
    change: '+1.3%',
    trend: 'down' as const,
    icon: AlertTriangle,
    topColor: '#F59E0B',
    sparkColor: '#EF4444',
    sparkData: [5.8, 6.0, 6.2, 6.4, 6.6, 6.9, 7.1, 7.3, 7.5, 7.7, 7.9, 8.0, 8.2],
  },
  {
    label: 'Avg Progress',
    value: '54%',
    change: '+4.2%',
    trend: 'up' as const,
    icon: Target,
    topColor: '#A855F7',
    sparkColor: '#A855F7',
    sparkData: [38, 39, 41, 42, 44, 45, 47, 48, 50, 51, 52, 53, 54],
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isDown = card.trend === 'down';
        const TrendIcon = isDown ? TrendingDown : TrendingUp;
        const trendColor = isDown ? '#EF4444' : '#22C55E';

        return (
          <div
            key={card.label}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: '#0D1526',
              border: '1px solid rgba(255,255,255,0.06)',
              borderTop: `2px solid ${card.topColor}`,
            }}
          >
            {/* Subtle bg glow */}
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${card.topColor}15 0%, transparent 70%)`,
                transform: 'translate(30%, -30%)',
              }}
            />

            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>
                  {card.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#E2E8F7' }}>
                  {card.value}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${card.topColor}20` }}
              >
                <Icon size={16} style={{ color: card.topColor }} />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: trendColor }}
              >
                <TrendIcon size={12} />
                <span>{card.change}</span>
                <span className="font-normal" style={{ color: '#475569' }}>
                  &nbsp;vs last month
                </span>
              </div>
              <Sparkline data={card.sparkData} color={card.sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
