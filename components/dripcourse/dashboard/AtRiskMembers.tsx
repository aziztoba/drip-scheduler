import { AlertTriangle, MessageSquare, Bell } from 'lucide-react';

type RiskLevel = 'high' | 'medium';

type Member = {
  name: string;
  initials: string;
  risk: number;
  level: RiskLevel;
  lastActive: string;
  stuckOn?: string;
  progress: number;
  gradientFrom: string;
  gradientTo: string;
};

const members: Member[] = [
  {
    name: 'Sarah Johnson',
    initials: 'SJ',
    risk: 87,
    level: 'high',
    lastActive: 'Last active 12 days ago',
    stuckOn: 'Stuck on M2',
    progress: 32,
    gradientFrom: '#6366F1',
    gradientTo: '#A855F7',
  },
  {
    name: 'Marcus Taylor',
    initials: 'MT',
    risk: 74,
    level: 'high',
    lastActive: 'Last active 9 days ago',
    stuckOn: '0% on M2',
    progress: 25,
    gradientFrom: '#A855F7',
    gradientTo: '#EC4899',
  },
  {
    name: 'Aiko Lindström',
    initials: 'AL',
    risk: 58,
    level: 'medium',
    lastActive: 'Last active 6 days ago',
    progress: 44,
    gradientFrom: '#F59E0B',
    gradientTo: '#EC4899',
  },
  {
    name: 'Ryan Chen',
    initials: 'RC',
    risk: 44,
    level: 'medium',
    lastActive: 'Last active 5 days ago',
    progress: 51,
    gradientFrom: '#6366F1',
    gradientTo: '#22C55E',
  },
];

function RiskBadge({ risk, level }: { risk: number; level: RiskLevel }) {
  const color = level === 'high' ? '#EF4444' : '#F59E0B';
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0"
      style={{ background: `${color}18`, color }}
    >
      <AlertTriangle size={10} />
      {risk}%
    </div>
  );
}

export function AtRiskMembers() {
  const highRisk = members.filter((m) => m.level === 'high').length;
  const mediumRisk = members.filter((m) => m.level === 'medium').length;

  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col"
      style={{
        background: '#0D1526',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
          At-Risk Members
        </h3>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
        >
          <AlertTriangle size={11} />7 at risk
        </div>
      </div>

      {/* Summary row */}
      <div
        className="flex items-center gap-4 p-3 rounded-xl mb-4 text-xs"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <span className="font-bold" style={{ color: '#EF4444' }}>{highRisk}</span>
          <span className="ml-1" style={{ color: '#94A3B8' }}>high risk</span>
        </div>
        <div
          className="w-px h-4"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        <div>
          <span className="font-bold" style={{ color: '#F59E0B' }}>{mediumRisk}</span>
          <span className="ml-1" style={{ color: '#94A3B8' }}>medium risk</span>
        </div>
        <div
          className="w-px h-4"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        <div>
          <span className="font-bold" style={{ color: '#E2E8F7' }}>$1,240</span>
          <span className="ml-1" style={{ color: '#94A3B8' }}>MRR at risk</span>
        </div>
      </div>

      {/* Member list */}
      <div className="space-y-3 flex-1">
        {members.map((member) => {
          const isHigh = member.level === 'high';
          const actionColor = isHigh ? '#EF4444' : '#F59E0B';
          const ActionIcon = isHigh ? MessageSquare : Bell;
          const actionLabel = isHigh ? 'Reach Out' : 'Send Nudge';

          return (
            <div
              key={member.name}
              className="p-3.5 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})`,
                  }}
                >
                  {member.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold truncate" style={{ color: '#E2E8F7' }}>
                      {member.name}
                    </p>
                    <RiskBadge risk={member.risk} level={member.level} />
                  </div>
                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                    {member.lastActive}
                    {member.stuckOn && (
                      <span style={{ color: '#EF4444' }}> · {member.stuckOn}</span>
                    )}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${member.progress}%`,
                          background: isHigh
                            ? 'linear-gradient(90deg, #EF4444, #F59E0B)'
                            : 'linear-gradient(90deg, #F59E0B, #22C55E)',
                        }}
                      />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>
                      {member.progress}% course progress
                    </p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button
                className="mt-3 w-full h-8 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
                style={{
                  background: `${actionColor}15`,
                  border: `1px solid ${actionColor}30`,
                  color: actionColor,
                }}
              >
                <ActionIcon size={12} />
                {actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
