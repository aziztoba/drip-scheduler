import { Lock } from 'lucide-react';

type TimelineItem = {
  day: number;
  module: string;
  title: string;
  completion?: number;
  status: 'released' | 'upcoming' | 'future';
  releaseText?: string;
  dotColor: string;
};

const items: TimelineItem[] = [
  {
    day: 1,
    module: 'Module 1',
    title: 'Marketing Fundamentals',
    completion: 94,
    status: 'released',
    dotColor: '#6366F1',
  },
  {
    day: 7,
    module: 'Module 2',
    title: 'Content Strategy',
    completion: 68,
    status: 'released',
    dotColor: '#A855F7',
  },
  {
    day: 14,
    module: 'Module 3',
    title: 'Paid Advertising & PPC',
    status: 'upcoming',
    releaseText: '🔒 Releasing in 3 days',
    dotColor: '#EC4899',
  },
  {
    day: 21,
    module: 'Module 4',
    title: 'Analytics & Growth Hacking',
    status: 'future',
    releaseText: '🔒 Not yet released',
    dotColor: '#475569',
  },
];

export function DripScheduleTimeline() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: '#0D1526',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
            Drip Schedule
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
            Module release timeline
          </p>
        </div>
        <button
          className="text-xs px-2.5 py-1 rounded-lg"
          style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#A855F7',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          Edit Schedule
        </button>
      </div>

      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={item.day} className="flex gap-3">
            {/* Left: dot + line */}
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 z-10"
                style={{
                  background: item.status === 'future' ? 'rgba(71,85,105,0.2)' : `${item.dotColor}25`,
                  border: `2px solid ${item.dotColor}`,
                  color: item.dotColor,
                  boxShadow: item.status === 'released' ? `0 0 12px ${item.dotColor}50` : 'none',
                }}
              >
                {item.day}
              </div>
              {i < items.length - 1 && (
                <div
                  className="w-px flex-1 my-1"
                  style={{
                    background: i < 1 && items[i + 1]
                      ? `linear-gradient(to bottom, ${item.dotColor}, ${items[i + 1]!.dotColor})`
                      : 'rgba(255,255,255,0.08)',
                    minHeight: 28,
                  }}
                />
              )}
            </div>

            {/* Right: content */}
            <div className={`flex-1 pb-4 ${i === items.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>
                    Day {item.day} · {item.module}
                  </p>
                  <p
                    className="text-xs font-semibold mt-0.5 truncate"
                    style={{ color: item.status === 'future' ? '#475569' : '#E2E8F7' }}
                  >
                    {item.title}
                  </p>
                </div>
                <Lock
                  size={12}
                  className="flex-shrink-0 mt-1"
                  style={{
                    color: item.status === 'released' ? '#22C55E' : '#475569',
                    opacity: item.status === 'released' ? 0 : 1,
                  }}
                />
              </div>

              {item.completion !== undefined ? (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                      Completion
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: item.dotColor }}>
                      {item.completion}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.completion}%`,
                        background: item.dotColor,
                        boxShadow: `0 0 8px ${item.dotColor}60`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p
                  className="text-[11px] mt-1"
                  style={{
                    color: item.status === 'upcoming' ? '#EC4899' : '#475569',
                  }}
                >
                  {item.releaseText}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
