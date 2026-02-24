import { Bell, BookOpen, Lock } from 'lucide-react';

function CountdownBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="rounded-2xl w-[72px] h-[72px] flex items-center justify-center mb-2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span
          className="text-[28px] font-bold tabular-nums"
          style={{ color: '#E2E8F7' }}
        >
          {value}
        </span>
      </div>
      <span
        className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: '#475569' }}
      >
        {label}
      </span>
    </div>
  );
}

export function LockedModulePanel() {
  return (
    <aside
      className="flex-shrink-0 overflow-y-auto p-5"
      style={{
        width: 380,
        background: '#080E1A',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Locked module hero card */}
      <div className="p-[1px] rounded-2xl mb-4" style={{
        background: 'linear-gradient(135deg, #6366F1, #A855F7 50%, #EC4899)',
      }}>
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.25) 0%, rgba(13,21,38,0.98) 65%)',
          }}
        >
          {/* Background glows */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
              transform: 'translate(-30%, 30%)',
            }}
          />

          {/* Tag */}
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(168,85,247,0.2)',
                border: '1px solid rgba(168,85,247,0.3)',
              }}
            >
              <Lock size={10} style={{ color: '#A855F7' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#A855F7' }}>
                Module 3 · Locked
              </span>
            </div>
          </div>

          {/* Module name */}
          <h2 className="text-lg font-bold mb-2 relative z-10" style={{ color: '#E2E8F7' }}>
            Paid Advertising & PPC
          </h2>
          <p className="text-xs mb-6 relative z-10" style={{ color: '#94A3B8' }}>
            Master Google Ads, Meta campaigns, and advanced PPC strategies that scale.
          </p>

          {/* Big gradient number */}
          <div className="text-center mb-4 relative z-10">
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1"
              style={{ color: '#94A3B8' }}
            >
              Unlocks In
            </p>
            {/* Giant "3" */}
            <div
              className="text-[96px] font-black leading-none mb-1"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.4))',
              }}
            >
              3
            </div>
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: '#94A3B8' }}
            >
              Days
            </p>
          </div>

          {/* Countdown blocks */}
          <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
            <CountdownBlock value="03" label="Days" />
            <div className="text-xl font-bold mb-6" style={{ color: '#475569' }}>:</div>
            <CountdownBlock value="14" label="Hours" />
            <div className="text-xl font-bold mb-6" style={{ color: '#475569' }}>:</div>
            <CountdownBlock value="22" label="Mins" />
          </div>

          {/* Unlock date */}
          <p
            className="text-xs text-center mb-6 relative z-10"
            style={{ color: '#94A3B8' }}
          >
            Unlocks on{' '}
            <span style={{ color: '#E2E8F7', fontWeight: 600 }}>Wednesday, Feb 27, 2026</span>
          </p>

          {/* CTA button */}
          <button
            className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 relative z-10 transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)',
              boxShadow: '0 4px 24px rgba(168,85,247,0.35)',
            }}
          >
            <Bell size={15} />
            Get Notified
          </button>

          {/* Or divider */}
          <div className="flex items-center gap-3 my-4 relative z-10">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: '#475569' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Secondary button */}
          <button
            className="w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 relative z-10 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8',
            }}
          >
            <BookOpen size={15} />
            Preview Curriculum
          </button>
        </div>
      </div>

      {/* Next up: Module 4 */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: '#0D1526',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>
          Also Coming Up
        </p>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Lock size={14} style={{ color: '#475569' }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: '#E2E8F7' }}>
              Module 4 — Analytics & Growth Hacking
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#A855F7' }}>
              Unlocks in 10 Days
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
