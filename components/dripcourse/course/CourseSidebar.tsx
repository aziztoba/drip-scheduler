import { CheckCircle2, Lock } from 'lucide-react';

type LessonStatus = 'done' | 'current' | 'upcoming';
type ModuleStatus = 'done' | 'active' | 'locked';

type Lesson = { title: string; status: LessonStatus };
type Module = {
  id: number;
  title: string;
  status: ModuleStatus;
  unlockText?: string;
  lessons: Lesson[];
};

const modules: Module[] = [
  {
    id: 1,
    title: 'Marketing Fundamentals',
    status: 'done',
    lessons: [
      { title: 'Introduction to Marketing', status: 'done' },
      { title: 'Market Research Basics', status: 'done' },
      { title: 'Target Audience Analysis', status: 'done' },
    ],
  },
  {
    id: 2,
    title: 'Content Strategy',
    status: 'active',
    lessons: [
      { title: 'Content Planning 101', status: 'done' },
      { title: 'SEO Writing That Converts', status: 'current' },
      { title: 'Social Media Content', status: 'upcoming' },
    ],
  },
  {
    id: 3,
    title: 'Paid Advertising & PPC',
    status: 'locked',
    unlockText: 'Unlocks in 3 Days',
    lessons: [],
  },
  {
    id: 4,
    title: 'Analytics & Growth Hacking',
    status: 'locked',
    unlockText: 'Unlocks in 10 Days',
    lessons: [],
  },
];

function LessonDot({ status }: { status: LessonStatus }) {
  if (status === 'done') {
    return (
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(34,197,94,0.15)' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
      </div>
    );
  }
  if (status === 'current') {
    return (
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(99,102,241,0.2)',
          boxShadow: '0 0 0 2px rgba(99,102,241,0.35)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#6366F1', boxShadow: '0 0 6px #6366F1' }}
        />
      </div>
    );
  }
  return (
    <div
      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
    </div>
  );
}

function ModuleItem({ module }: { module: Module }) {
  const isDone = module.status === 'done';
  const isActive = module.status === 'active';
  const isLocked = module.status === 'locked';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={isActive ? { boxShadow: '0 0 0 1px rgba(99,102,241,0.3)' } : undefined}
    >
      {/* Module header row */}
      <div
        className="p-3.5 flex items-center gap-3 cursor-pointer transition-colors"
        style={{
          background: isActive
            ? 'rgba(99,102,241,0.1)'
            : isDone
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(255,255,255,0.02)',
          borderLeft: isActive ? '2px solid #6366F1' : '2px solid transparent',
          opacity: isLocked ? 0.65 : 1,
        }}
      >
        {/* Icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            background: isDone
              ? 'rgba(34,197,94,0.15)'
              : isActive
              ? 'rgba(99,102,241,0.2)'
              : 'rgba(255,255,255,0.06)',
          }}
        >
          {isDone ? (
            <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
          ) : isLocked ? (
            <Lock size={12} style={{ color: '#94A3B8' }} />
          ) : (
            <span style={{ color: '#A855F7' }}>{module.id}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium truncate"
            style={{ color: isLocked ? '#475569' : '#E2E8F7' }}
          >
            Module {module.id}
          </p>
          <p
            className="text-[11px] truncate mt-0.5"
            style={{ color: isLocked ? '#475569' : '#94A3B8' }}
          >
            {module.title}
          </p>
        </div>

        {isDone && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
          >
            Done
          </span>
        )}
        {isLocked && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#475569' }}
          >
            Locked
          </span>
        )}
      </div>

      {/* Sub-lessons */}
      {module.lessons.length > 0 && (
        <div
          className="px-4 pb-3 pt-2 space-y-2"
          style={{
            background: isActive ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.015)',
          }}
        >
          {module.lessons.map((lesson) => (
            <div key={lesson.title} className="flex items-center gap-2.5 py-0.5">
              <LessonDot status={lesson.status} />
              <span
                className="text-[11px]"
                style={{
                  color:
                    lesson.status === 'current'
                      ? '#E2E8F7'
                      : lesson.status === 'done'
                      ? '#94A3B8'
                      : '#475569',
                  fontWeight: lesson.status === 'current' ? 500 : 400,
                }}
              >
                {lesson.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Locked unlock text */}
      {isLocked && module.unlockText && (
        <div
          className="px-4 pb-3 pt-1"
          style={{ background: 'rgba(255,255,255,0.01)' }}
        >
          <p className="text-[10px] font-medium" style={{ color: '#A855F7' }}>
            {module.unlockText}
          </p>
        </div>
      )}
    </div>
  );
}

export function CourseSidebar() {
  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: 340,
        background: '#0D1526',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="p-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2
          className="font-semibold text-sm mb-3"
          style={{ color: '#E2E8F7' }}
        >
          Digital Marketing Mastery
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Modules', value: '2/4' },
            { label: 'Progress', value: '30%' },
            { label: 'Time Left', value: '6h' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="text-[10px] mb-1" style={{ color: '#94A3B8' }}>
                {stat.label}
              </p>
              <p className="text-sm font-bold" style={{ color: '#E2E8F7' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {modules.map((module) => (
          <ModuleItem key={module.id} module={module} />
        ))}
      </div>
    </aside>
  );
}
