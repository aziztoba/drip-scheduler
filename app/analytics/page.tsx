import { DashboardNavbar } from '@/components/dripcourse/dashboard/DashboardNavbar';
import { DashboardSidebar } from '@/components/dripcourse/dashboard/DashboardSidebar';
import { KPICards } from '@/components/dripcourse/dashboard/KPICards';
import { EngagementChart } from '@/components/dripcourse/dashboard/EngagementChart';
import { DripScheduleTimeline } from '@/components/dripcourse/dashboard/DripScheduleTimeline';
import { ChurnChart } from '@/components/dripcourse/dashboard/ChurnChart';
import { AtRiskMembers } from '@/components/dripcourse/dashboard/AtRiskMembers';

export default function DashboardPage() {
  return (
    <div
      className="dc-app flex flex-col"
      style={{ minHeight: '100vh', background: '#080E1A' }}
    >
      <DashboardNavbar />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        <DashboardSidebar />

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: '#080E1A' }}
        >
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#E2E8F7' }}>
                Analytics Dashboard
              </h1>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                Digital Marketing Mastery · Last updated just now
              </p>
            </div>

            {/* Time filter */}
            <div
              className="flex items-center rounded-xl p-1 gap-1"
              style={{ background: '#0D1526', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {['7D', '30D', '90D', 'All'].map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={
                    filter === '30D'
                      ? {
                          background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                          color: '#fff',
                        }
                      : { color: '#94A3B8' }
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards />
          </div>

          {/* Bottom 3-column grid */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px 380px' }}>
            {/* Left: Engagement chart */}
            <EngagementChart />

            {/* Center column: Drip schedule + Churn chart */}
            <div className="flex flex-col gap-4">
              <DripScheduleTimeline />
              <ChurnChart />
            </div>

            {/* Right: At-risk members */}
            <AtRiskMembers />
          </div>
        </main>
      </div>
    </div>
  );
}
