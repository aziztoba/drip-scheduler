export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
          <span className="text-white font-bold text-2xl">D</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Drip Content Scheduler
        </h1>

        <p className="text-slate-600 leading-relaxed mb-8">
          Automatically unlock course modules for your Whop members based on when
          they joined. Keep them engaged. Reduce churn.
        </p>

        {/* Use plain <a> — NOT Next.js <Link> — so the router never
            pre-fetches this API route and never generates a "phantom"
            PKCE session that would overwrite the real nonce cookie. */}
        <a
          href="/api/auth/whop/login"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Connect Your Whop →
        </a>

        <p className="text-xs text-slate-400 mt-4">
          Free plan available · No credit card required
        </p>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { emoji: "⏱️", label: "Day-based drip" },
            { emoji: "🔔", label: "Auto notifications" },
            { emoji: "📊", label: "Progress tracking" },
          ].map((f) => (
            <div key={f.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-2xl mb-1">{f.emoji}</div>
              <div className="text-xs font-medium text-slate-600">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
