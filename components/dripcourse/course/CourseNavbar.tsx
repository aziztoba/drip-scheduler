import { BookOpen, HelpCircle } from 'lucide-react';
import { Logo } from '../Logo';

export function CourseNavbar() {
  return (
    <nav
      className="h-16 flex items-center px-6 gap-6 sticky top-0 z-50"
      style={{
        background: '#0D1526',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Logo />

      {/* Center: course title + progress bar */}
      <div className="flex-1 flex flex-col items-center max-w-sm mx-auto gap-1.5">
        <span className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
          Digital Marketing Mastery
        </span>
        <div className="w-full flex items-center gap-2.5">
          <div
            className="flex-1 h-1.5 rounded-full relative overflow-visible"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: '30%',
                background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)',
              }}
            />
            {/* Glowing dot at end */}
            <div
              className="absolute top-1/2"
              style={{
                left: '30%',
                transform: 'translate(-50%, -50%)',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#A855F7',
                boxShadow: '0 0 10px 2px rgba(168,85,247,0.7)',
              }}
            />
          </div>
          <span className="text-xs whitespace-nowrap" style={{ color: '#94A3B8' }}>
            30% complete
          </span>
        </div>
      </div>

      {/* Right nav */}
      <div className="flex items-center gap-5 ml-auto">
        <button
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: '#94A3B8' }}
        >
          <BookOpen size={15} />
          My Courses
        </button>
        <button
          className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: '#94A3B8' }}
        >
          <HelpCircle size={15} />
          Help
        </button>
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
        >
          JD
        </div>
      </div>
    </nav>
  );
}
