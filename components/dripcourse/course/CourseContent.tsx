import { Play, ChevronRight, FileText, BookOpen, Clock } from 'lucide-react';

export function CourseContent() {
  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ background: '#080E1A' }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        {['My Courses', 'Digital Marketing Mastery', 'Module 2'].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-2">
            <span
              className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: i === arr.length - 1 ? '#E2E8F7' : '#475569' }}
            >
              {crumb}
            </span>
            {i < arr.length - 1 && <ChevronRight size={12} style={{ color: '#475569' }} />}
          </span>
        ))}
      </div>

      {/* Lesson title */}
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#E2E8F7' }}>
        SEO Writing That Converts
      </h1>

      {/* Video player */}
      <div
        className="rounded-2xl overflow-hidden mb-6 relative"
        style={{
          background: '#0D1526',
          border: '1px solid rgba(255,255,255,0.06)',
          aspectRatio: '16/9',
          maxHeight: 420,
        }}
      >
        {/* Thumbnail / dark area */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        >
          {/* Play button */}
          <button
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)',
              boxShadow: '0 0 40px rgba(168,85,247,0.4)',
            }}
          >
            <Play size={22} className="text-white ml-1" fill="white" />
          </button>
          <p className="text-sm mt-4" style={{ color: '#94A3B8' }}>
            Click to play lesson
          </p>
        </div>

        {/* Bottom controls bar */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{
            background: 'linear-gradient(to top, rgba(13,21,38,0.95), transparent)',
          }}
        >
          {/* Progress scrubber */}
          <div className="mb-2.5 relative">
            <div
              className="w-full h-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {/* Filled */}
              <div
                className="h-full rounded-full"
                style={{
                  width: '35%',
                  background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                }}
              />
              {/* Scrubber dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  left: '35%',
                  transform: 'translate(-50%, -50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#A855F7',
                  boxShadow: '0 0 8px rgba(168,85,247,0.8)',
                  border: '2px solid #E2E8F7',
                }}
              />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Play size={14} className="text-white ml-0.5" fill="white" />
              </button>
              <span className="text-xs font-mono" style={{ color: '#94A3B8' }}>
                6:42 / 19:24
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                1× Speed
              </span>
              <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                CC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson meta row */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-1.5">
          <Clock size={13} style={{ color: '#94A3B8' }} />
          <span className="text-xs" style={{ color: '#94A3B8' }}>19 min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} style={{ color: '#94A3B8' }} />
          <span className="text-xs" style={{ color: '#94A3B8' }}>Content Strategy · Lesson 2 of 3</span>
        </div>
      </div>

      {/* Lesson notes card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#0D1526',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} style={{ color: '#A855F7' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#E2E8F7' }}>
            Lesson Notes
          </h3>
        </div>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
            In this lesson, you&apos;ll learn how to write SEO-optimized content that not only ranks well
            but also converts readers into customers. We cover keyword intent, content structure,
            and the psychology behind high-converting copy.
          </p>
          <div className="space-y-2">
            {[
              'Understanding search intent (informational vs transactional)',
              'The AIDA framework applied to SEO content',
              'Internal linking strategy for conversion paths',
              'Measuring content performance with GA4',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }}
                />
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
