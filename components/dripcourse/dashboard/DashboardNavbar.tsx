'use client';

import { useState } from 'react';
import { ChevronDown, Download, Plus, Calendar } from 'lucide-react';
import { Logo } from '../Logo';

const tabs = ['Analytics', 'Members', 'Drip Schedule', 'Content', 'Settings'];

export function DashboardNavbar() {
  const [activeTab, setActiveTab] = useState('Analytics');

  return (
    <nav
      className="h-16 flex items-center px-6 gap-6 sticky top-0 z-50 flex-shrink-0"
      style={{
        background: '#0D1526',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Logo />

      {/* Course selector */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#E2E8F7',
        }}
      >
        <span>Digital Marketing Mastery</span>
        <ChevronDown size={14} style={{ color: '#94A3B8' }} />
      </button>

      {/* Nav tabs */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activeTab === tab ? '#A855F7' : '#94A3B8',
              border: activeTab === tab ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#94A3B8',
          }}
        >
          <Calendar size={12} />
          Feb 24, 2026
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94A3B8',
          }}
        >
          <Download size={14} />
          Export
        </button>

        <button
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{
            background: 'linear-gradient(90deg, #6366F1, #A855F7)',
            boxShadow: '0 2px 16px rgba(99,102,241,0.3)',
          }}
        >
          <Plus size={15} />
          New Module
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}
        >
          AC
        </div>
      </div>
    </nav>
  );
}
