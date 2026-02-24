export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5 flex-shrink-0 select-none">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Progress ring — 270° arc, gap at bottom-right */}
        <circle
          cx="18" cy="18" r="15"
          stroke="url(#dc-ring)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="70.6 23.6"
          fill="none"
          transform="rotate(-90 18 18)"
        />
        {/* Lock body */}
        <rect x="11" y="18" width="14" height="11" rx="2.5" fill="url(#dc-lock)" />
        {/* Lock shackle */}
        <path
          d="M14 18v-4a4 4 0 0 1 8 0v4"
          stroke="url(#dc-shackle)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Keyhole */}
        <circle cx="18" cy="22.5" r="1.6" fill="#080E1A" opacity="0.85" />
        <rect x="17.2" y="23.5" width="1.6" height="2.2" rx="0.8" fill="#080E1A" opacity="0.85" />

        <defs>
          <linearGradient id="dc-ring" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="dc-lock" x1="11" y1="18" x2="25" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="dc-shackle" x1="14" y1="10" x2="22" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-[15px] text-white tracking-tight">DripCourse</span>
          <span className="text-[9px] tracking-[0.15em] uppercase" style={{ color: '#94A3B8' }}>
            Unlock Learning Over Time
          </span>
        </div>
      )}
    </a>
  );
}
